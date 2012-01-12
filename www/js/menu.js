/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var Menu = new function() {
	var self = this;
	var infoView = 'ProjectInfo';
	var showInfo = true;

	self.init = function(success) {
		window.plugins.nativeControls.createTabBar(); 
		window.plugins.nativeControls.createTabBarItem("start", "Początek","/www/img/icon-Home.png", {onSelect: Menu.start}); 
		window.plugins.nativeControls.createTabBarItem("addmark","Dodaj zakładkę","/www/img/icon-Bookmarks.png", {onSelect: Menu.bookmark}); 
		
		//window.plugins.nativeControls.createTabBarItem("info",self.infoLabel,"/www/img/icon-Tag.png", {onSelect: Menu.info}); 
		//window.plugins.nativeControls.createTabBarItem("night","Tryb nocny","", {onSelect: Menu.toggleNightMode}); 
		//window.plugins.nativeControls.showTabBarItems("start", "addmark", "info", "night"); 
		//window.plugins.nativeControls.showTabBar();
		self.setInfoButton(self.infoView, 'O projekcie', self.showInfo);
		self.setNightModeLabel();
		success && success();
	};

	self.start = function() {
		History.visit('');
		window.plugins.nativeControls.selectTabBarItem('');
	};

	self.info = function() {
		History.visit(self.infoView + '/' + View.currentPar);
		window.plugins.nativeControls.selectTabBarItem('');
	};

	self.bookmark = function() {
		var name = prompt('Nazwa zakładki');
		if (name != null)
			History.addBookmark(name);
		window.plugins.nativeControls.selectTabBarItem('');
	};

	self.setNightModeLabel = function() {
		var label = 'Tryb nocny';
		if (View.getNightMode()) label = 'Tryb dzienny';
		window.plugins.nativeControls.createTabBarItem("night",label,"/www/img/icon-Night.png", {onSelect: Menu.toggleNightMode}); 
		self.refresh();
	};

	self.refresh = function() {
		var items = new Array();
		if (View.currentView != 'Index')
			items.push('start');
		items.push("addmark");
		if (self.showInfo)
			items.push("info");
		items.push("night");
		window.plugins.nativeControls.showTabBarItems.apply(this, items);
		window.plugins.nativeControls.showTabBar();
	};

	self.toggleNightMode = function() {
		View.toggleNightMode();
		self.setNightModeLabel();
	};

	self.setInfoButton = function(view, label, enabled) {
		self.infoView = view;
		self.showInfo = enabled;
		window.plugins.nativeControls.createTabBarItem("info",label,"/www/img/icon-Info.png", {onSelect: Menu.info}); 
	};
}
