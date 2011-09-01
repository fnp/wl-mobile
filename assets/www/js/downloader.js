/**
 *  
 * @return Object literal singleton instance of Downloader
 */
var Downloader = { 
	/**
     * @param fileUrl
     * @param dirName
     * @param fileName
     * @param overwrite
     * @param win
     * @param fail
     */
	downloadFile: function(fileUrl,dirName,fileName,overwrite,win,fail) {
		if(overwrite==false) overwrite="false";
		else overwrite="true";
		return PhoneGap.exec(win, fail, "Downloader", "downloadFile", [fileUrl,dirName,fileName,overwrite]);
	}
};
