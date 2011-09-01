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
			console.log('local fs found: ' + fs.root.fullPath);
			self.root = fs.root;
			success && success();
		}, function() {
			console.log('local fs not found');
			success && success();
		});
	};


	this.withLocalHtml = function(book_id, success, error) {
		console.log('info:withLocalHtml: id:' + book_id);
		View.spinner('Otwieranie treści utworu');
		if (!self.root)
			error && error('info:withLocalHtml: no local html: no usable filesystem');

		var url = "file://" + self.root.fullPath + "/html/" + book_id;
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


	this.withLocal = function(win, fail) {
		if (self.root) {
			self.root.getDirectory('html', {}, function(dir) {
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
		console.log('info:withHtmlFromServer: id:' + book_id);
		// read file from WL
		Catalogue.withBook(book_id, function(book) {
			var url = WL + book.html_file;
			console.log('info:withHtmlFromServer: fetching url: ' + url);

			View.spinner("Pobieranie treści utworu z sieci");

			if (self.root) {
				Downloader.downloadFile(url, self.root.fullPath + "/html/", ""+book_id, true,
					function(data){
						console.log('info:withHtmlFromServer: loaded file from WL');
						self.withLocalHtml(book_id, success, error);
					}, function(data) {
						console.log('error downloading file!')
						error && error("error: " + data);
					});
			}
			else {
				// there's no big fs, so we'll just get the text from AJAX
				console.log('info:withHtmlFromServer: ajax: ' + url);
				var xhr = new XMLHttpRequest();
				xhr.open("GET", url);
				xhr.onload = function() {
					console.log('info:withHtmlFromServer: fetched by ajax: ' + url);
					success && success(xhr.responseText);
				}
				xhr.onerror = function() {
					console.log('error downloading file!')
					error && error("error: " + data);
				}
				xhr.send();
			}
		});		
	};
	
	// calls the callback with contents of the HTML file for a given book,
	// loaded from the server and cached locally
	this.withHtml = function(id, success, error) {
		console.log('info:withHtml: id:' + id);
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
