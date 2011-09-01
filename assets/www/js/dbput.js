/**
 *  
 * @return Object literal singleton instance of DBPut
 */
var DBPut = { 
	/**
     * @param asset Path to the asset (relative to assets dir)
     * @param target Path to DB file (relative to app db files dir)
     * @param overwrite
     * @param win Success callback
     * @param fail Error callback
     */
	put: function(asset, target, overwrite, win, fail) {
		if (overwrite==false) overwrite="false";
		else overwrite="true";
		return PhoneGap.exec(
			win, 
			fail, 
			"DBPut", 
			"put", 
			[asset, target, overwrite]
		);
	},
	fetch: function(url, win, fail) {
		return PhoneGap.exec(
			win, 
			fail, 
			"DBPut", 
			"fetch", 
			[url]
		);
	}
};

