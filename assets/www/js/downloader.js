function Downloader() {
 
}
 
Downloader.prototype.downloadFile = function(fileUrl,dirName,fileName,overwrite,win,fail) {
 if(overwrite==false) overwrite="false";
 else overwrite="true";
 PhoneGap.exec(win, fail, "Downloader", "downloadFile", [fileUrl,dirName,fileName,overwrite]);
 
};
 
PhoneGap.addConstructor(function() {
 PhoneGap.addPlugin("downloader", new Downloader());
 PluginManager.addService("Downloader","pl.org.nowoczesnapolska.wlmobi.Downloader");
});