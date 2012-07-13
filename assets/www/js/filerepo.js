/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var FileRepo = new function() {
	/* API for files repository */
	var self = this;

	this.init = function(success, error) {
		success();
	};

	this.withLocalHtml = function(book_id, success, error) {
		console.log('info:withLocalHtml: id:' + book_id);
		View.spinner('Otwieranie treści utworu');

		var url = "html/" + book_id + '.html';
		console.log('info:withLocalHtml: local ajax: ' + url);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			console.log('info:withLocalHtml: fetched by local ajax: ' + url);
			success && success(xhr.responseText);
		}
		xhr.onerror = error;
		xhr.send();
	};


	// calls the callback with contents of the HTML file for a given book,
	// loaded from app data
	this.withHtml = function(id, success, error) {
		console.log('info:withHtml: id:' + id);
		self.withLocalHtml(id, success);
	};
};
