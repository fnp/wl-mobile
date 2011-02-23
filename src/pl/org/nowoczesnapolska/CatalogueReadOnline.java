package pl.org.nowoczesnapolska;

import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebView;

public class CatalogueReadOnline extends Activity {
	public void onCreate(Bundle savedInstanceState) {
	    super.onCreate(savedInstanceState);
	    setContentView(R.layout.catalogue_read_online);

	    WebView mWebView = (WebView) findViewById(R.id.webview);
	    mWebView.getSettings().setJavaScriptEnabled(true);
	    mWebView.loadUrl("http://www.wolnelektury.pl/katalog/lektura/hold-dwa-sonety.html");
	}
}
