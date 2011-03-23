package pl.org.nowoczesnapolska;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;

import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.commonshttp.CommonsHttpOAuthConsumer;
import oauth.signpost.exception.OAuthCommunicationException;
import oauth.signpost.exception.OAuthExpectationFailedException;
import oauth.signpost.exception.OAuthMessageSignerException;
import oauth.signpost.exception.OAuthNotAuthorizedException;

import org.apache.http.Header;
import org.apache.http.HeaderIterator;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.ProtocolVersion;
import org.apache.http.RequestLine;
import org.apache.http.client.HttpClient;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.params.HttpParams;

import android.app.Activity;
import android.net.Uri;
import android.util.Log;

public class Auth extends Activity {
	private AuthHelper aHelper;
	/* OAuth */
	private OAuthConsumer mConsumer;
	private OAuthProvider mProvider;
	private String mCallbackUrl;
	private String authURL;
	private String apiURL = "http://epsilon.nowoczesnapolska.org.pl/api/";	
	
	@Override
	public void onResume(){
        super.onResume();
        aHelper = new AuthHelper();
        
		String[] token = getVerifier();
		if (token != null){
			try {
				Log.d("resume", "token0: "+token[0]);
				Log.d("resume", "token1: "+token[1]);
				
				//String accessToken[] = AuthHelper.getAccessToken(token[1]);

				Log.d("resume", "token0: " + token[0]);
				Log.d("resume", "token1: " + token[1]);				
				mConsumer = new CommonsHttpOAuthConsumer(token[0], token[1]);
				
				final URL url = new URL(apiURL+"tags/abc.json");
				Log.d("url", "token1: "+url.toString());
				
				HttpGet request = new HttpGet(url.toURI());
				mConsumer.sign(request);
				
				Log.d("url", "podpisany req");				
				
				HttpClient httpClient = new DefaultHttpClient();
				HttpResponse response = httpClient.execute(request);
				
			} catch (OAuthMessageSignerException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (OAuthExpectationFailedException e) {
				// TODO Auto-generated catch block11
				e.printStackTrace();
			} catch (OAuthCommunicationException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (MalformedURLException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (IOException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			} catch (URISyntaxException e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}	
		}
	}
	
	private String[] getVerifier() {
		// extract the token if it exists
		Uri uri = this.getIntent().getData();
		if (uri == null) {
			Log.d("resume", "beforetoken null");
			return null;
		}

		String token = uri.getQueryParameter("oauth_token");
		String verifier = uri.getQueryParameter("oauth_verifier");
		Log.d("resume", "token+verifier");
		return new String[] { token, verifier };
	}	
}
