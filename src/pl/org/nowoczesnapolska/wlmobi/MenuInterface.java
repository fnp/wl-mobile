/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

package pl.org.nowoczesnapolska.wlmobi;

import org.json.JSONArray;
import org.json.JSONException;

import android.graphics.Color;
import android.webkit.WebView;

import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;

public class MenuInterface extends Plugin{

	public static String infoLabel = "Proszę czekać...";
	public static Boolean infoEnabled = false;
	public static Boolean nightEnabled = false;
	public static WebView view;

	@Override
	public PluginResult execute(String action, JSONArray args, String callbackId) {
		if (action.equals("setInfoButton")) {
			try {
				return this.setInfoButton(args.getString(0), args.getString(1));
			} catch (JSONException e) {
				return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
			}
		}
		else if (action.equals("setNightMode")) {
			try {
				return this.setNightMode(args.getString(0));
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

	private PluginResult setNightMode(String enabled) {
    	nightEnabled = enabled.equals("true");
    	if (nightEnabled) {
    		view.setBackgroundColor(0x222222ff);
    	}
    	else {
    		view.setBackgroundColor(Color.WHITE);
    	}

		return new PluginResult(PluginResult.Status.OK);
	}
}
