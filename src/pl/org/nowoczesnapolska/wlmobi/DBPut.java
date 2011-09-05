/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

package pl.org.nowoczesnapolska.wlmobi;

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
import pl.org.nowoczesnapolska.wlmobi.Downloader;

public class DBPut extends Plugin{

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		if (action.equals("put")) {
			try {
				return this.put(args.getString(0), args.getString(1), args.getString(2));
			} catch (JSONException e) {
				return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
			}
		}
		else if (action.equals("fetch")) {
			try {
				return this.fetch(args.getString(0));
			} catch (JSONException e) {
				return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
			}
		}
		else {
			return new PluginResult(PluginResult.Status.INVALID_ACTION);
		}
	}

	private PluginResult fetch(String url) {
		String fileName = "0000000000000001.db";
		String targetPath = "/data/data/" + this.ctx.getPackageName() + "/app_database/file__0/";
		
		Log.d("DBPut", "database path: " + targetPath + " / " + fileName);
		
		Downloader d = new Downloader();
		return d.downloadUrl(url, targetPath, fileName, "true");
	}


	private PluginResult put(String assetPath, String targetPath, String overwrite) {
		// this hard-coding is kinda creepy, should probably create the db and use getDatabasePath instead
		String absoluteTargetPath = "/data/data/" + this.ctx.getPackageName() + "/app_database/" + targetPath;
		int index = absoluteTargetPath.lastIndexOf('/');
		String targetDir = absoluteTargetPath.substring(0, index);

		try {
			File dir = new File(targetDir);
			if(!dir.exists()) {
				Log.d("DBPut", "directory " + targetDir + " created");
				dir.mkdirs();
			}

			File fout = new File(absoluteTargetPath);

			if(overwrite.equals("false") && fout.exists()) {
				Log.d("DBPut", "File already exists");
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

			Log.d("DBPut", "Copied to " + absoluteTargetPath);
		} catch (IOException e) {
			Log.d("DBPut", "Error: " + e);
			return new PluginResult(PluginResult.Status.ERROR, "Error: " + e);
		}
		return new PluginResult(PluginResult.Status.OK, absoluteTargetPath);
	}
}