// FIXME: htmlescape strings!

var VERSION = '0.1';


var FileRepo = new function() {
	/* API for files repository */
	var self = this;
	const WL_URL = 'http://www.wolnelektury.pl';
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


	// downloads HTML file from server, saves it in cache and calls success with file contents
	this.withHtmlFromServer = function(book_id, success, error) {
		console.log('info:withHtmlFromServer: id:' + book_id);
		// read file from WL
		Catalogue.withBook(book_id, function(book) {
			var url = WL_URL + book.html_file;
			console.log('info:withHtmlFromServer: fetching url: ' + url);

			View.spinner("Pobieranie treści utworu z sieci");

			if (self.root) {
				window.plugins.downloader.downloadFile(url, self.root.fullPath + "/html/", ""+book_id, true,
					function(data){
						console.log('info:withHtmlFromServer: loaded file from WL');
						self.withLocalHtml(book_id, success, error);
					}, function(data) {
						console.log('error downloading file!')
						error && error("error: "+data);
					});
			}
			else {
				// there's no big fs, so we'll just get the text from AJAX
				console.log('info:withHtmlFromServer: ajax: ' + url);
				var xhr = new XMLHttpRequest();
				xhr.open(url);
				xhr.onload = function() {
					console.log('info:withHtmlFromServer: fetched by ajax: ' + url);
					success && success(xhr.responseText);
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
};


var View = new function() {
	var self = this;
	self.minOffset = 1000;
	//self.element
	self.categories = {
			autor: 'Autorzy', 
			rodzaj: 'Rodzaje',
			gatunek: 'Gatunki',
			epoka: 'Epoki'
	};
	

	self.init = function() {
		console.log('View.init');

		self.viewStack = [];
		self.current;
		navigator.app.overrideBackbutton(); 
		document.addEventListener("backbutton", View.goBack, true);

		self._searchbox = document.getElementById("searchbox");
		self._searchinput = document.getElementById("search");
		self._content = document.getElementById("content");

		self.enter(location.href);
	};


	this.sanitize = function(text) {
		return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
	};

	this.showSearch = function() {
		self._searchbox.style.display = "block";
	};

	this.hideSearch = function() {
		self._searchbox.style.display = "none";
	};

	this.spinner = function(text) {
		if (!text)
			text = "Ładowanie";
		self._content.innerHTML = "<div class='spinner'><img src='img/spinner.gif' /><br/><span id='spinnertext'>" + text +"</span></div>";
		scroll(0, 0);
	};

	this.content = function(text) {
		console.log('content');

		self._content.innerHTML = '';
		self._content.innerHTML = text;
		scroll(0, 0);
	}
	
	this.enter = function(url) {
		console.log('View.enter: ' + url);

		self.current = url;
		var view = 'Index';
		var arg = null;

		var query_start = url.indexOf('?');
		if (query_start != -1) {
			var slash_index = url.indexOf('/', query_start + 1);
			if (slash_index != -1) {
				view = url.substr(query_start + 1, slash_index - query_start - 1);
				arg = url.substr(slash_index + 1);
			}
			else {
				view = url.substr(query_start + 1);
			}
		}
		console.log('View.enter: ' + view + ' ' + arg);
		self['enter' + view](arg);
	}
	
	this.enterIndex = function(arg) {
		console.log('enterIndex');
		self.showSearch();
		var html = "<div class='book-list'>";
		for (category in self.categories)
			html += self.a('Category', category) + self.categories[category] + "</a>\n"; 
		html += "</div>" +
				"<p id='logo'><img src='img/wl-logo.png' alt='Wolne Lektury' /><br/>\n" +
				"szkolna biblioteka internetowa" +
				//"<br/>v. " + VERSION +
				"</p>";
		self.content(html);
	};
	
	this.enterBook = function(id) {
		id = parseInt(id);
		console.log('enterBook: ' + id);
		self.showSearch();

		Catalogue.withBook(id, function(book) {
		Catalogue.withChildren(id, function(children) {
		Catalogue.withAuthors(id, function(authors) {
			var html = "<h1><span class='subheader'>";
			var auths = [];
			for (a in authors) auths.push(authors[a].name);
			html += auths.join(", ");
			html += "</span>" + book.title + "</h1>\n";
			if (book.html_file) {
				html += "<p class='buttons'>" + self.a('BookText', id) + "Czytaj tekst</a></p>";
			}
			if (children.length) {
				html += "<div class='book-list'>";
				for (c in children) {
					child = children[c];
					html += self.a('Book', child.id) + child.title + "</a>\n";
				}
				html += "</div>";
			}
			self.content(html);				
		});
		});
		});
	}
	
	this.enterBookText = function(id) {
		id = parseInt(id);
		self.spinner("Otwieranie utworu");
		console.log('enterBookText: ' + id);
		self.hideSearch();
		
		FileRepo.withHtml(id, function(data) {
			self.content(data);
		});
	}

	this.enterTag = function(id) {
		id = parseInt(id);
		console.log('enterTag: ' + id);
		self.showSearch();

		self.spinner("Otwieranie listy utworów");

		Catalogue.withTag(id, function(tag) {
			var html = "<h1><span class='subheader upper'>" + tag.category + ': </span>' + tag.name + "</h1>\n";
			html += "<div class='book-list'>";
			if (tag._books) {
				Catalogue.withBooks(tag._books, function(books) {
					for (var i in books) {
						var book = books[i];
						html += self.a('Book', book.id) + book.title + "</a>\n";
					}
					html += "</div>";
					self.content(html);
				});
			}
		});
	};


	this.enterCategory = function(category) {
		console.log('enterCategory: ' + category);
		self.spinner("Otwieranie katalogu");
		self.showSearch();

		Catalogue.withCategory(category, function(tags) {
			var html = "<h1>" + self.categories[category] + "</h1>\n";
			html += "<div class='book-list'>";
			for (i in tags) {
				tag = tags[i];
				html += self.a('Tag', tag.id) + tag.name + "</a>\n";
			}
			html += "</div>";
			self.content(html);
		});
	};



	this.enterSearch = function(query) {
		console.log('enterTag: ' + query);
		self.showSearch();

		var html = "<h1><span class='subheader'>Szukana fraza:</span>" + View.sanitize(query) + "</h1>\n";

		if (query.length < 2) {
			html += "<p>Szukana fraza musi mieć co najmniej dwa znaki</p>";
			self.content(html);
			return;
		}

		Catalogue.withSearch(query, function(results) {
			if (results.length == 1) {
				self.enter(self.href(results[0].view, results[0].id));
				return;
			}
			if (results.length == 0) {
				html += "<p>Brak wyników wyszukiwania</p>";
			}
			else {
				html += "<div class='book-list'>";
				for (var i in results) {
					var result = results[i];
					html += self.a(result.view, result.id) + result.label + "</a>\n";
				}
				html += "</div>";
			}
			self.content(html);
		});
	};


	/* search form submit callback */
	this.search = function() {
		self.goTo('?Search/' + self._searchinput.value);
		return false;
	}
	
	
	this.href = function(view, par) {
		return "?"+view+"/"+par;
	};
	
	this.a = function(view, par) {
		return "<a class='"+view+"' onclick='View.goTo(\"" + 
					self.href(view, par).replace(/["']/g, "\\$&") + "\");'>";
	};
	
	this.goTo = function(url) {
		self.viewStack.push(self.current);
		console.log('goTo: ' + url);
		self.enter(url);
	};
	
	this.goBack = function() {
		if (self.viewStack.length > 0) {
			var url = self.viewStack.pop();
			console.log('goBack: ' + url);
			self.enter(url);
		}
		else {
			console.log('exiting');
			navigator.app.exitApp();
		}
	};
}


/*
// for preparing sql statements
// use like: 
//   var s = new Sql("INSERT ... '{0}', '{1}' ...";
//   s.prepare("abc", ...)
var Sql = function(scheme) {
	var self = this;
	self.text = scheme;
	
	self.sql_escape = function(term) {
		return term.toString().replace("'", "''");
	};
	
	self.prepare = function() {
		var args = arguments;
		return self.text.replace(/{(\d+)}/g, function(match, number) {
			return self.sql_escape(args[number]);
		});
	}
};*/


var Catalogue = new function() {
	/* API for database */

	var self = this;
	self.db = null;

	this.init = function(success, error) {
		console.log('Catalogue.init');
		
		self.updateDB(function() {
			self.db = window.openDatabase("wolnelektury", "1.0", "WL Catalogue", 1);
			if (self.db) {
				/*var regexp = {
						onFunctionCall: function(val) {
							var re = new RegExp(val.getString(0));
								if (val.getString(1).match(re))
									return 1;
								else
									return 0;
						}
					};
				self.db.createFunction("REGEXP", 2, regexp);*/

				success && success();
			} else {
				error && error('Nie mogę otworzyć bazy danych: ' + err);
			}
			
		}, function(err) {
			error && error('Błąd migracji: ' + err);
		});
	};

	self.sqlSanitize = function(term) {
		return term.toString().replace("'", "''");
	};


	/* check if DB needs updating and upload a fresh copy, if so */
	this.updateDB = function(success, error) {
		var db_ver = '0.1.3';
		if (window.localStorage.getItem('db_ver') == db_ver) {
			console.log('db ok, skipping')
			success && success();
			return;
		}

		var done = function() {
			window.localStorage.setItem('db_ver', db_ver);
			console.log('db updated');
			success && success();
		};

		// db initialize
		// this is Android-specific for now
		var version = device.version.split('.')[0];
		switch(version) {
		case '1':
			self.upload_db_android1(done, error);
			break;
		case '2':
			self.upload_db_android2(done, error);
			break;
		case '3':
		default:
			error && error('Błąd migracji: ' + err);
		};
	};


	this.upload_db_android1 = function(success, error) {
		console.log('upload db for Android 1.x');
		window.requestFileSystem(LocalFileSystem.APPLICATION, 0, function(fs) {
			window.plugins.assetcopy.copy("initial/wolnelektury.db",
					fs.root.fullPath + "/databases/wolnelektury.db", true,
					function(data) {
						console.log('db upload successful');
						success && success();
					}, function(data) {
						error && error("database upload error: " + data);
					});
		}, error);
	};


	this.upload_db_android2 = function(success, error) {
		console.log('upload db for Android 2.x');
		window.requestFileSystem(LocalFileSystem.APPLICATION, 0, function(fs) {

			// upload databases description file
			window.plugins.assetcopy.copy("initial/Databases.db",
				fs.root.fullPath + "/app_database/Databases.db", true,
				function(data) {
					console.log('db descriptior upload successful');

					// upload the database file
					window.plugins.assetcopy.copy("initial/0000000000000001.db",
						fs.root.fullPath + "/app_database/file__0/0000000000000001.db", true,
						function(data) {
							console.log('db upload successful');
							success && success();
						}, function(data) {
							error && error("database upload error: " + data);
						});

					
				}, function(data) {
					error && error("database descriptor upload error: " + data);
				});

		}, error);
	};


	this.withBook = function(id, callback) {
		console.log('withBook '+id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE id="+id, [], 
				function(tx, results) {
					callback(results.rows.item(0));
				});
		});
	};

	this.withBooks = function(ids, callback) {
		console.log('withBooks ' + ids)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE id IN ("+ids+") ORDER BY title", [], 
				function(tx, results) {
					var items = [];
					var count = results.rows.length;
					for (var i=0; i<count; ++i) {
						items.push(results.rows.item(i));
					}
					callback(items);
				});
		});
	};

	this.withAuthors = function(id, callback) {
		console.log('withAuthors ' + id);

		self.db.transaction(function(tx) {
			tx.executeSql("SELECT t.name " +
					"FROM book_tag bt LEFT JOIN tag t ON t.id=bt.tag " +
					"WHERE bt.book="+id+" AND t.category='autor' " +
					"ORDER BY t.sort_key", [], 
				function(tx, results) {
					var tags = [];
					var count = results.rows.length;
					for (var i=0; i<count; ++i) {
						tags.push(results.rows.item(i));
					}
					callback(tags);
				});
		});
	};
	
	this.withChildren = function(id, callback) {
		console.log('withChildren ' + id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE parent="+id+" ORDER BY parent_number", [], 
				function(tx, results) {
					var books = [];
					var count = results.rows.length;
					for (var i=0; i<count; ++i) {
						books.push(results.rows.item(i));
					}
					callback(books);
			});
		});
	};

	this.withTag = function(id, callback) {
		console.log('withTag '+id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM tag WHERE id="+id, [], 
				function(tx, results) {
					callback(results.rows.item(0));
				});
		});
	};

	this.withCategory = function(category, callback) {
		console.log('withCategory ' + category)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM tag WHERE category='"+category+"'", [], 
				function(tx, results) {
					var items = [];
					var count = results.rows.length;
					for (var i=0; i<count; ++i)
						items.push(results.rows.item(i));
					callback(items);
				});
		});
	};


/*	this.withUnrelatedBooks = function(books, success) {
		if (books.length == 0) return books;

		var book_ids = {};
		for (i in books) {
			book_ids[books[i].id] = true;
		}
		var new_books = [];

		var addIfUnrelated = function(book) {
			var addIfUnrelated_wrapped = function(b) {
				if (b.parent) {
					if (b.parent in book_ids) {
						// go to next book
						filterBooks();
					}
					else self.withBook(b.parent, addIfUnrelated_wrapped);
				}
				else {
					new_books.push(book);
					// go to next book
					filterBooks();
				}
			};
			addIfUnrelated_wrapped(book);
		};


		var filterBooks = function() {
			console.log('filterBooks: ' + books.length);
			if (books.length) {
				addIfUnrelated(books.shift());
			}
			else {
				success && success(new_books);
			}
		};
		
		filterBooks();
	};


	this.withBooksTagged = function(tag, callback, withChildren) {
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT book.* " +
					"FROM book LEFT JOIN book_tag ON book_tag.book=book.id " +
					"WHERE book_tag.tag="+tag+" ORDER BY book.title", [], 
				function(tx, results) {
					var books = [];
					var count = results.rows.length;
					console.log('withBooksTagged('+tag+'): '+count);
					for (var i=0; i<count; ++i) {
						books.push(results.rows.item(i));
					}
					if (withChildren)
						callback(books);
					else self.withUnrelatedBooks(books, callback);
				});
		});
	};
*/

	/* takes a query, returns a list of {view,id,label} objects to a callback */
	this.withSearch = function(term, callback) {
		console.log('searching...');
		var found = [];

		function booksFound(tx, results) {
			var len = results.rows.length;
			console.log('found books: ' + len);
			for (var i=0; i<len; i++) {
				var item = results.rows.item(i);
				found.push({
					view: "Book",
					id: item.id,
					label: item.title
				});
			}
		};

		function tagsFound(tx, results) {
			var len = results.rows.length;
			console.log('found tags: ' + len);
			for (var i=0; i<len; i++) {
				var item = results.rows.item(i);
				found.push({
					view: "Tag",
					id: item.id,
					label: item.name + ' (' + item.category + ')'
				});
			}
			// TODO error handling
			callback(found);
		};


		// FIXME escaping
		// TODO pliterki, start of the word match
		self.db.transaction(function(tx) {
			sql_term = self.sqlSanitize(term); // this is still insane, % and _
			tx.executeSql("SELECT id, title FROM book WHERE title LIKE '%"+sql_term+"%' ORDER BY title LIMIT 10", [],
			//tx.executeSql("SELECT id, title FROM book WHERE title REGEXP '.*"+sql_term+".*' ORDER BY title", [],
				function(tx, results) {
					// save the books
					booksFound(tx, results);
					// and proceed to tags
					tx.executeSql("SELECT id, name, category FROM tag WHERE name LIKE '%"+sql_term+"%' ORDER BY name LIMIT 10",
							[], tagsFound);
				},
				function(err) {
					console.log('ERROR:search: '+err.code);
					callback([]);
				});
		});
	};

/*
	// each book and tag in its own transaction
	// TODO: error handling
	self.parse = function(json, success, error) {
		console.log('parsing');
		var sqls = [];
		var addBookSql = new Sql("INSERT INTO book (id, title, html_file, html_file_size) VALUES ('{0}', '{1}', '{2}', '{3}')");
		var addBookTagSql = new Sql("INSERT INTO book_tag (book, tag) VALUES ('{0}', '{1}')");
		var addTagSql = new Sql("INSERT INTO tag (id, category, name) VALUES ('{0}', '{1}', '{2}')");

		var bookValues = [];
		var books = json.added.books;
		while (books.length) {
			var book = books.shift();
			if (!book.html) book.html = '';
			if (!book.html_size) book.html_size = '';
			sqls.push(addBookSql.prepare(book.id, book.title, book.html, book.html_size));
			for (var t in book.tags) {
				sqls.push(addBookTagSql.prepare(book.id, book.tags[t]));
			}
		}
		console.log('ASSERT json.added.books.length=0: ' + json.added.books.length);

		var categories = {author: 'autor', epoch: 'epoch', genre: 'genre', kind: 'kind', theme: 'motyw'};
		var tags = json.added.tags;
		while (tags.length) {
			var tag = tags.shift();
			sqls.push(addTagSql.prepare(tag.id, categories[tag.category], tag.name));
		}

		self.chainSql(sqls, success, error);
	}; */
}



function onLoad() {
	console.log('onLoad');
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	console.log('onDeviceReady');
	var error = function(err) { alert(err); };
	Catalogue.init(
		function() {
			console.log('after catalogue.init');
			FileRepo.init(
				function() {
					console.log('after FileRepo.init');
					View.init();
				},
				error);
		}, error);
}
