/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

/**
 *  
 * @return Object literal singleton instance of MenuInterface
 */
var MenuInterface = { 
	/**
     * @param asset Path to the asset (relative to assets dir)
     * @param target Path to DB file (relative to app db files dir)
     * @param overwrite
     * @param win Success callback
     * @param fail Error callback
     */
	setInfoButton: function(label, enabled, win, fail) {
		if (enabled == false) enabled = "false";
		else enabled = "true";
		return PhoneGap.exec(
			win, 
			fail, 
			"MenuInterface", 
			"setInfoButton", 
			[label, enabled]
		);
	},
};

