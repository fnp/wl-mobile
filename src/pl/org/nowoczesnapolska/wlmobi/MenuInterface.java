package pl.org.nowoczesnapolska.wlmobi;

/*
 @author Radek Czajka
 */

import org.json.JSONArray;
import org.json.JSONException;

import android.util.Log;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class MenuInterface extends Plugin{

	public static String infoLabel = "Proszę czekać...";
	public static Boolean infoEnabled = false;

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		if (action.equals("setInfoButton")) {
			try {
				return this.setInfoButton(args.getString(0), args.getString(1));
			} catch (JSONException e) {
				return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
			}
		}
		else {
			return new PluginResult(PluginResult.Status.INVALID_ACTION);
		}
	}

	private PluginResult setInfoButton(String label, String enabled) {
    	infoLabel = label;
    	infoEnabled = enabled.equals("true");

		return new PluginResult(PluginResult.Status.OK);
	}
}
