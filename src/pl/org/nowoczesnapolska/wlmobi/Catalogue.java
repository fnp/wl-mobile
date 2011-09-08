/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

package pl.org.nowoczesnapolska.wlmobi;

import android.graphics.Color;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.WebSettings;

import com.phonegap.*;

public class Catalogue extends DroidGap {

	String infoLabel = "Proszę czekać";
	Boolean infoEnabled = false;

    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);


        super.loadUrl("file:///android_asset/www/index.html");

        MenuInterface.view = appView;

        WebSettings settings = this.appView.getSettings();
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
    }

	@Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	menu.add(Menu.NONE, 1, 1, "Początek");
    	menu.add(Menu.NONE, 3, 2, "Dodaj zakładkę");
    	menu.add(Menu.NONE, 2, 3, MenuInterface.infoLabel);
    	menu.add(Menu.NONE, 4, 4, "Tryb nocny");
        //MenuInflater inflater = getMenuInflater();
        //inflater.inflate(R.menu.game_menu, menu);
        return super.onCreateOptionsMenu(menu);
    }

    @Override
    public boolean onPrepareOptionsMenu(Menu menu) {
    	MenuItem mi = menu.getItem(1);
    	mi.setTitle(MenuInterface.infoLabel);
    	mi.setEnabled(MenuInterface.infoEnabled);
    	return super.onPrepareOptionsMenu(menu);
    }


    @Override
    public boolean onKeyDown(int i,KeyEvent e){
    	if (e.getKeyCode() == KeyEvent.KEYCODE_MENU) {
    		return false;
    	}
        return super.onKeyDown(i, e);
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
    	switch (item.getItemId()) {
    	case 1:
    		this.appView.loadUrl("javascript:Menu.start();");
    		break;
    	case 2:
    		this.appView.loadUrl("javascript:Menu.info();");
    		break;
    	case 3:
    		this.appView.loadUrl("javascript:Menu.bookmark();");
    		break;
    	case 4:
    		this.appView.loadUrl("javascript:Menu.toggleNightMode();");
    		break;
    	default:
    		return super.onOptionsItemSelected(item);
    	}
    	return true;
    }
}