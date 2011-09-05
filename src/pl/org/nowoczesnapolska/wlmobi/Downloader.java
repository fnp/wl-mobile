package pl.org.nowoczesnapolska.wlmobi;
 
/*
 @author Mauro Rocco http://www.toforge.com
 
 Radek Czajka: don't prepend /sdcard/
*/
 
import org.json.JSONArray;
import org.json.JSONException;
 
import android.util.Log;
 
import com.phonegap.api.Plugin;
import com.phonegap.api.PluginResult;
 
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
 
public class Downloader extends Plugin{
 
 @Override
 public PluginResult execute(String action, JSONArray args, String callbackId) {
 if (action.equals("downloadFile")) {
 try {
 return this.downloadUrl(args.getString(0),args.getString(1),args.getString(2),args.getString(3));
 } catch (JSONException e) {
 return new PluginResult(PluginResult.Status.ERROR, "Param errrors");
 }
 }
 else {
 return new PluginResult(PluginResult.Status.INVALID_ACTION);
 }
 
 }
 
 PluginResult downloadUrl(String fileUrl, String dirName, String fileName, String overwrite){
 try{
 Log.d("DownloaderPlugin", "DIRECTORY CALLED "+dirName+" created");
 File dir =     new File(dirName);
 if(!dir.exists()){
 Log.d("DownloaderPlugin", "directory "+dirName+" created");
 dir.mkdirs();
 }
 
 File file = new File(dirName+fileName);
 
 if(overwrite.equals("false") && file.exists()){
 Log.d("DownloaderPlugin", "File already exist");
 return new PluginResult(PluginResult.Status.OK, "exist");
 }
 
 URL url = new URL(fileUrl);
 Log.d("DownloaderPlugin", "connecting to server for downloading " + url);
 HttpURLConnection ucon = (HttpURLConnection) url.openConnection();
 ucon.setRequestMethod("GET");
 ucon.setDoOutput(true);
 ucon.connect();
 
 Log.d("DownloaderPlugin", "download begining");
 
 Log.d("DownloaderPlugin", "download url:" + url);
 
 InputStream is = ucon.getInputStream();
 
 byte[] buffer = new byte[1024];
 
 int len1 = 0;
 
 FileOutputStream fos = new FileOutputStream(file);
 
 while ( (len1 = is.read(buffer)) > 0 ) {
 fos.write(buffer, 0, len1);
		 //new String(buffer, "ISO8859_1").getBytes("UTF-8"), 0, len1);
 }
 
 fos.close();
 
 Log.d("DownloaderPlugin", "Download complete in" + fileName);
 
 } catch (IOException e) {
 
 Log.d("DownloaderPlugin", "Error: " + e);
 return new PluginResult(PluginResult.Status.ERROR, "Error: " + e);
 
 }
 
 return new PluginResult(PluginResult.Status.OK, fileName);
 
 }
 
}