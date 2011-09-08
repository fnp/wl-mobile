/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var Menu = new function() {
	var self = this;
	var infoView = "ProjectInfo";

	self.init = function() {
		window.MenuInterface.setNightMode(View.getNightMode());
	};

	self.start = function() {
		History.visit('');
	};

	self.info = function() {
		History.visit(self.infoView + '/' + View.currentPar);
	};

	self.bookmark = function() {
		var name = prompt('Nazwa zakładki');
		if (name != null)
			History.addBookmark(name);
	};

	self.toggleNightMode = function() {
		View.toggleNightMode();
		window.MenuInterface.setNightMode(View.getNightMode());
	};

	self.setInfoButton = function(view, label, enabled) {
		self.infoView = view;
		window.MenuInterface.setInfoButton(label, enabled);
	};
}
