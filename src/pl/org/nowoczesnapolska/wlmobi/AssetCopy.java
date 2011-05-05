package pl.org.nowoczesnapolska.wlmobi;

/*
 @author Radek Czajka
 */

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;
import android.content.res.AssetManager;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.IOException;

public class AssetCopy extends Plugin{

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		if (action.equals("copy")) {
			try {
				return this.copy(args.getString(0), args.getString(1), args.getString(2));
			} catch (JSONException e) {
				return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
			}
		}
		else {
			return new PluginResult(PluginResult.Status.INVALID_ACTION);
		}
	}

	private PluginResult copy(String assetPath, String targetPath, String overwrite) {
		int index = targetPath.lastIndexOf('/');
		String targetDir = targetPath.substring(0, index);

		try {
			File dir = new File(targetDir);
			if(!dir.exists()) {
				Log.d("AssetCopy", "directory " + targetDir + " created");
				dir.mkdirs();
			}

			File fout = new File(targetPath);

			if(overwrite.equals("false") && fout.exists()) {
				Log.d("AssetCopy", "File already exists");
				return new PluginResult(PluginResult.Status.OK, "exist");
			}

			FileOutputStream fos = new FileOutputStream(fout);

			AssetManager assetManager = this.ctx.getResources().getAssets();
			InputStream is = assetManager.open(assetPath);

			byte[] buffer = new byte[1024];
			int len1 = 0;

			while ( (len1 = is.read(buffer)) > 0 ) {
				fos.write(buffer,0, len1);
			}

			fos.close();

			Log.d("AssetCopy", "Copied to " + targetPath);
		} catch (IOException e) {
			Log.d("AssetCopy", "Error: " + e);
			return new PluginResult(PluginResult.Status.ERROR, "Error: " + e);
		}
		return new PluginResult(PluginResult.Status.OK, targetPath);
	}
}