package pl.org.nowoczesnapolska;

import java.io.UnsupportedEncodingException;

import oauth.signpost.OAuth;
import oauth.signpost.OAuthConsumer;
import oauth.signpost.OAuthProvider;
import oauth.signpost.commonshttp.CommonsHttpOAuthConsumer;
import oauth.signpost.commonshttp.CommonsHttpOAuthProvider;
import oauth.signpost.exception.OAuthCommunicationException;
import oauth.signpost.exception.OAuthExpectationFailedException;
import oauth.signpost.exception.OAuthMessageSignerException;
import oauth.signpost.exception.OAuthNotAuthorizedException;
import android.util.Log;

public class AuthHelper {

	
	/* OAuth */
	private static OAuthConsumer mConsumer;
	private static OAuthProvider mProvider;
	private static String mCallbackUrl;
	private static String apiURL = "http://192.168.148.129/api/";

	public static void OAuthHelper(String consumerKey, String consumerSecret, String callbackUrl)
	throws UnsupportedEncodingException {
		mConsumer = new CommonsHttpOAuthConsumer(consumerKey, consumerSecret);
		mProvider = new CommonsHttpOAuthProvider(
				apiURL+"oauth/request_token/",
				apiURL+"oauth/access_token/",
				apiURL+"oauth/authorize/");
		mProvider.setOAuth10a(true);
		mCallbackUrl = (callbackUrl == null ? OAuth.OUT_OF_BAND : callbackUrl);
	}    


	public static String getRequestToken()
	throws OAuthMessageSignerException, OAuthNotAuthorizedException,
	OAuthExpectationFailedException, OAuthCommunicationException {
		String authUrl = mProvider.retrieveRequestToken(mConsumer, mCallbackUrl);
		return authUrl;
	}

	public static String[] getAccessToken(String verifier)
	throws OAuthMessageSignerException, OAuthNotAuthorizedException,
	OAuthExpectationFailedException, OAuthCommunicationException {
		Log.d("resume", "beforetoken");
		mProvider.retrieveAccessToken(mConsumer, verifier);
		return new String[] {
				mConsumer.getToken(), mConsumer.getTokenSecret()
		};
	}
	
	
}
