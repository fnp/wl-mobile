package pl.org.nowoczesnapolska;

import java.io.UnsupportedEncodingException;

import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.View.OnClickListener;
import android.widget.Button;

public class SignIn extends Activity {
	Context ctx;
	
	/* OAuth */
	private String authURL;
	private String callbackUrl = "wl://callback";
	
	@Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.signin);
        ctx = this;
        new AuthHelper();
        
        Button sign_in = (Button) findViewById(R.id.sign_in);
        sign_in.setOnClickListener(new OnClickListener() {
			
			@Override
			public void onClick(View v) {
				// TODO Auto-generated method stub
				String consumerKey = "testKey";
				String consumerSecret = "testSecret";
				try {
					AuthHelper.OAuthHelper(consumerKey, consumerSecret, callbackUrl);
				} catch (UnsupportedEncodingException e1) {
					// TODO Auto-generated catch block
					e1.printStackTrace();
				}

				try {
					authURL = AuthHelper.getRequestToken();
					startActivity(new Intent("android.intent.action.VIEW", Uri.parse(authURL)));
				} catch (Exception e) {
				}
		
			}
		});
    }
    
}