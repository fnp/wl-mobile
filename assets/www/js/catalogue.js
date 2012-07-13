/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var DB_VER = 'o0.2';


var categories = {'author': 'autor',
              'epoch': 'epoka', 
              'genre': 'gatunek', 
              'kind': 'rodzaj', 
              'theme': 'motyw'
              }

// FIXME: htmlescape strings!


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
			return self.sql_escape(args[parseInt(number)]);
		});
	}
};


var Catalogue = new function() {
	/* API for database */

	var self = this;
	self.db = null;

	this.init = function(success, error) {
		console.log('Catalogue.init');
		
		self.updateDB(function() {
			self.db = window.openDatabase("wolnelektury", "1.0", "WL Catalogue", 1);
			if (self.db) {
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
		var has_ver = window.localStorage.getItem('db_ver');
		if (has_ver == DB_VER) {
			console.log('db ok, skipping')
			success && success();
			return;
		}

		var done = function() {
			window.localStorage.setItem('db_ver', DB_VER);
			console.log('db updated');
			success && success();
		};

		// db initialize
		// this is Android-specific for now
		self.upload_db_android(done, error);
	};


	this.upload_db_android = function(success, error) {
		console.log('upload db for Android 2.x+');

		var dbname = "wolnelektury";
		window.AssetCopy.copy("initial/Databases.db",
			"/data/data/pl.org.nowoczesnapolska.wloffline/app_database/Databases.db", true,
			function(data) {
				console.log('db descriptor upload successful');
				window.AssetCopy.copy("initial/0000000000000001.db",
					"/data/data/pl.org.nowoczesnapolska.wloffline/app_database/file__0/0000000000000001.db", true,
					function(data) {
						console.log('db upload successful');
						success && success();
					}, function(data) {
						error && error("database upload error: " + data);
					});
			}, function(data) {
				error && error("database descriptor upload error: " + data);
			});
	};
	
	this.withState = function(callback) {
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM state", [], 
				function(tx, results) {
					if (results.rows.length) {
						callback(results.rows.item(0));
					}
					else {
						callback({last_checked: 0});
					}
				});
		});
	};


	this.withBook = function(id, callback, error) {
		console.log('withBook '+id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE id="+id, [], 
				function(tx, results) {
					if (results.rows.length) {
						callback(results.rows.item(0));
					}
					else {
						error && error();
					}
				});
		});
	};

	this.withBooks = function(ids, callback) {
		console.log('withBooks ' + ids)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE id IN ("+ids+") ORDER BY sort_key", [], 
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


	this.withChildren = function(id, callback) {
		console.log('withChildren ' + id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM book WHERE parent="+id+" ORDER BY parent_number, sort_key", [], 
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

	this.withTag = function(id, callback, error) {
		console.log('withTag '+id)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM tag WHERE id="+id, [], 
				function(tx, results) {
					if (results.rows.length) {
						callback(results.rows.item(0));
					}
					else {
						error && error();
					}
				});
		});
	};

	this.withCategory = function(category, callback) {
		console.log('withCategory ' + category)
		self.db.transaction(function(tx) {
			tx.executeSql("SELECT * FROM tag WHERE category='"+category+"' ORDER BY sort_key", [], 
				function(tx, results) {
					var items = [];
					var count = results.rows.length;
					for (var i=0; i<count; ++i)
						items.push(results.rows.item(i));
					callback(items);
				});
		});
	};


	/* takes a query, returns a list of {view,id,label} objects to a callback */
	this.withSearch = function(term, callback) {
		console.log('searching...');
		term =  term.replace(/^\s+|\s+$/g, '') ;
		var found = [];

		function booksFound(tx, results) {
			var len = results.rows.length;
			console.log('found books: ' + len);
			for (var i=0; i<len; i++) {
				var item = results.rows.item(i);
				found.push({
					view: "Book",
					item: item
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
					item: item
				});
			}
			// TODO error handling
			callback(found);
		};


		// FIXME escaping
		// TODO pliterki, start of the word match
		self.db.transaction(function(tx) {
			sql_term = self.sqlSanitize(term); // this is still insane, % and _
			tx.executeSql("SELECT * FROM book WHERE title LIKE '%"+sql_term+"%' ORDER BY sort_key LIMIT 10", [],
			//tx.executeSql("SELECT * FROM book WHERE title REGEXP '.*"+sql_term+".*' ORDER BY sort_key", [],
				function(tx, results) {
					// save the books
					booksFound(tx, results);
					// and proceed to tags
					tx.executeSql("SELECT * FROM tag WHERE name LIKE '%"+sql_term+"%' ORDER BY sort_key LIMIT 10",
							[], tagsFound);
				},
				function(err) {
					console.log('ERROR:search: '+err.code);
					callback([]);
				});
		});
	};

	self.chainSqls = function(sqls, success, error) {
		self.db.transaction(function(tx) {
			var do_next = function() {
				if (sqls.length) {
					var sql = sqls.shift();
					console.log(sql);
					tx.executeSql(sql, [], do_next, error);
				}
				else {
					success && success();
				}
			}
			do_next();
		});
	};


}
