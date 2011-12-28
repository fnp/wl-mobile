/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var FileRepo = new function() {
	/* API for files repository */
	var self = this;
	this.root = null;

	this.init = function(success, error) {
		self.initRoot(success);
	};

	this.initRoot = function(success) {
		// fs size is irrelevant, PERSISTENT is futile (on Android, at least)
		window.requestFileSystem(LocalFileSystem.TEMPORARY, 0, function(fs) {
			debug('local fs found: ' + fs.root.fullPath);
			self.root = fs.root;
			
			success && success();
		}, function() {
			debug('local fs not found');
			success && success();
		});
	};


	this.withLocalHtml = function(book_id, success, error) {
		debug('info:withLocalHtml: id:' + book_id);
		View.spinner('Otwieranie treści utworu');
		if (!self.root)
			error && error('info:withLocalHtml: no local html: no usable filesystem');

		var url = "file://" + self.root.fullPath + "/html/" + book_id;
		debug('info:withLocalHtml: local ajax: ' + url);
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.onload = function() {
			debug('info:withLocalHtml: fetched by local ajax: ' + url);
			success && success(xhr.responseText);
		}
		xhr.onerror = error;
		xhr.send();
	};


	this.withLocal = function(win, fail) {
		if (self.root) {
			self.root.getDirectory('html', {create:true}, function(dir) {
				var reader = dir.createReader();
				reader.readEntries(win, fail);
			});
		}
		else {
			win && win([]);
		}
	}


	// downloads HTML file from server, saves it in cache and calls success with file contents
	this.withHtmlFromServer = function(book_id, success, error) {
		debug('info:withHtmlFromServer: id:' + book_id);
		// read file from WL
		Catalogue.withBook(book_id, function(book) {
			var url = WL + book.html_file;
			debug('info:withHtmlFromServer: fetching url: ' + url);

			View.spinner("Pobieranie treści utworu z sieci");

			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.onload = function() {			
				data = xhr.responseText;
				if(xhr.status != 200) {
						   alert(xhr.status);
					error && error('Błąd podczas pobierania pliku');
				} else {
				  if (self.root) {
					self.root.getDirectory('html', {create: true}, function(dir) {
							var reader = dir.getFile(''+book_id, {create: true}, function(f) {
													 f.createWriter(function(w) {
																	w.write(data);
																	self.db.transaction(function(tx) {
																						alert('setlocal0');
																						tx.executeSql("UPDATE book SET _local=1 WHERE id="+book_id);
																						alert('setlocal1');
																						});
																	});
													 });
										   });
				  }
				  success && success(data);
				}
			};
			xhr.onerror = function(e) {
				debug('Błąd podczas pobierania pliku')
				error && error("error: " + data);
			};
			xhr.send();
		});		
	};
	
	// calls the callback with contents of the HTML file for a given book,
	// loaded from the server and cached locally
	this.withHtml = function(id, success, error) {
		debug('info:withHtml: id:' + id);
		self.withLocalHtml(id, success, function() {
			self.withHtmlFromServer(id, success, error);
		});
	};


	this.clear = function() {
		FileRepo.withLocal(function(local) {
			for (i in local) {
				local[i].remove();
			}
		});
	};


	this.deleteIfExists = function(id) {
		if (self.root) {
			self.root.getFile('html/' + id, {create: false}, function(f) {
				f.remove();
			});
		}
	}
};
