/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

/**
 *  
 * @return Object literal singleton instance of AssetCopy
 */
var AssetCopy = { 
	/**
     * @param asset Path to the asset (relative to assets dir)
     * @param target Path to DB file (relative to app db files dir)
     * @param overwrite
     * @param win Success callback
     * @param fail Error callback
     */
    copy: function(asset, target, overwrite, win, fail) {
		if(overwrite==false) overwrite="false";
		else overwrite="true";
		PhoneGap.exec(win, fail, "AssetCopy", "copy", [asset, target, overwrite]);
	},
};
