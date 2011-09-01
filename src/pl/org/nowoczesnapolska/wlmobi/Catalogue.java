package pl.org.nowoczesnapolska.wlmobi;

import android.os.Bundle;
import android.util.Log;
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

        WebSettings settings = this.appView.getSettings();
        settings.setSupportZoom(true);
        settings.setBuiltInZoomControls(true);
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
    	menu.add(Menu.NONE, 1, 1, "Początek");
    	menu.add(Menu.NONE, 2, 2, MenuInterface.infoLabel);
    	menu.add(Menu.NONE, 3, 3, "Dodaj zakładkę");
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
    	default:
    		return super.onOptionsItemSelected(item);
    	}
    	return true;
    }
}