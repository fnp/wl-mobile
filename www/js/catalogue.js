/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var DB_VER = '0.9.17';

var WL_INITIAL = WL + '/media/api/mobile/initial/initial.db';
var WL_UPDATE = WL + '/api/changes/SINCE.json?book_fields=author,html,parent,parent_number,sort_key,title' +
		'&tag_fields=books,category,name,sort_key' +
		'&tag_categories=author,epoch,genre,kind';



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
		debug('Catalogue.init');
		
		self.updateDB(success, function(err) {
			error && error('Błąd migracji: ' + err);
		});
	};

	self.sqlSanitize = function(term) {
		return term.toString().replace("'", "''");
	};


	/* check if DB needs updating and create it, if so */
	this.updateDB = function(success, error) {
		var has_ver = window.localStorage.getItem('db_ver');
		if (has_ver == DB_VER) {
			debug('db ok, skipping');
			if (!self.db)
				self.db = window.openDatabase("wolnelektury", "1.0", "WL Catalogue", 1000000);
			if (self.db) {
				success && success();
			} else {
				error && error('Nie mogę otworzyć bazy danych: ' + err);
			}
			return;
		}

		var done = function() {
			FileRepo.clear();
			window.localStorage.setItem('db_ver', DB_VER);
			debug('db updated');
			success && success();
		};

		// db initialize
		self.createdb(done, error);
	};


	this.createdb = function(success, error) {
		debug('create db');

		var dbname = "wolnelektury";
		var db = window.openDatabase(dbname, "1.0", "WL Catalogue", 1000000);
		if (db) {
			debug('db created successfully');
			self.db = db;
			var sqls = [];
			sqls.push('CREATE TABLE IF NOT EXISTS book (\
					  id INTEGER PRIMARY KEY,\
					  title VARCHAR,\
					  html_file VARCHAR,\
					  html_file_size INTEGER,\
					  parent INTEGER,\
					  parent_number INTEGER,\
					  sort_key VARCHAR,\
					  pretty_size VARCHAR,\
					  authors VARCHAR,\
					  _local BOOLEAN\
					  );');
			sqls.push('CREATE INDEX IF NOT EXISTS book_title_index ON book (title);');
			sqls.push('CREATE INDEX IF NOT EXISTS book_sort_key_index ON book (sort_key);');
			sqls.push('CREATE INDEX IF NOT EXISTS book_parent_index ON book (parent);');
			sqls.push('CREATE TABLE IF NOT EXISTS tag (\
					  id INTEGER PRIMARY KEY,\
					  name VARCHAR,\
					  category VARCHAR,\
					  sort_key VARCHAR,\
					  books VARCHAR\
					  );');
			sqls.push('CREATE INDEX IF NOT EXISTS tag_name_index ON tag (name);');
			sqls.push('CREATE INDEX IF NOT EXISTS tag_category_index ON tag (category);');
			sqls.push('CREATE INDEX IF NOT EXISTS tag_sort_key_index ON tag (name);');
			sqls.push('CREATE TABLE IF NOT EXISTS state (last_checked INTEGER);');
			sqls.push('DELETE FROM state;');
			sqls.push('INSERT INTO state (last_checked) VALUES(0);');
			// create database and sync it
			self.chainSqls(sqls, function() {self.sync(success, error);}, error);

		} else {
			error && error('Błąd podczas inicjowania bazy danych: ' + data);
		}
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
		debug('withBook '+id)
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
		debug('withBooks ' + ids)
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
		debug('withChildren ' + id)
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
		debug('withTag '+id)
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
		debug('withCategory ' + category)
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
		debug('searching...');
		term =  term.replace(/^\s+|\s+$/g, '') ;
		var found = [];

		function booksFound(tx, results) {
			var len = results.rows.length;
			debug('found books: ' + len);
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
			debug('found tags: ' + len);
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
					debug('ERROR:search: '+err.code);
					callback([]);
				});
		});
	};

	self.chainSqls = function(sqls, success, error) {
		self.db.transaction(function(tx) {
			var do_next = function() {
				if (sqls.length) {
					var sql = sqls.shift();
					debug(sql);
					tx.executeSql(sql, [], do_next, error);
				}
				else {
					success && success();
				}
			}
			do_next();
		});
	};


	self.update = function(data, success, error) {
		var addBookSql = new Sql("\
			INSERT OR REPLACE INTO book \
				(id, title, html_file,  html_file_size, parent, parent_number, sort_key, pretty_size, authors) \
			VALUES \
				('{0}', '{1}', '{2}', '{3}', '{4}', '{5}', '{6}', '{7}', '{8}')");
		var addTagSql = new Sql("INSERT OR REPLACE INTO tag (id, category, name, sort_key, books) VALUES ('{0}', '{1}', '{2}', '{3}', '{4}')");

		var sqls = [];

		if (data.deleted) {
			for (i in data.deleted.books) {
				var book_id = data.deleted.books[i];
				sqls.push("DELETE FROM book WHERE id=" + book_id);
				FileRepo.deleteIfExists(book_id);
			}

			for (i in data.deleted.tags) {
				var tag_id = data.deleted.tags[i];
				sqls.push("DELETE FROM tag WHERE id=" + tag_id);
			}
		}

		if (data.updated) {
			for (i in data.updated.books) {
				var book = data.updated.books[i];
				if (!book.html) book.html = {};
				if (!book.html.url) book.html.url = '';
				if (!book.html.size) book.html.size = '';
				if (!book.parent) book.parent = '';
				if (!book.parent_number) book.parent_number = '';
				var pretty_size = prettySize(book.html.size);
				sqls.push(addBookSql.prepare(
					book.id, book.title, book.html.url, book.html.size,
					book.parent, book.parent_number, book.sort_key, pretty_size, book.author
				));
				FileRepo.deleteIfExists(book.id);
			}

			for (i in data.updated.tags) {
				var tag = data.updated.tags[i];
				var category = categories[tag.category];
				var books = tag.books.join(',');
				sqls.push(addTagSql.prepare(tag.id, category, tag.name, tag.sort_key, books));
			}
		}

		sqls.push("UPDATE state SET last_checked=" + data.time_checked);

		self.chainSqls(sqls, function() {self.updateLocal(); success && success();}, error);
	};


	this.sync = function(success, error) {
		self.withState(function(state) {
			var url = WL_UPDATE.replace("SINCE", state.last_checked); 
			debug('sync: ' + url);
			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.onload = function() {
				debug('sync: fetched by ajax: ' + url);			
				self.update(JSON.parse(xhr.responseText), success, error);
			}
			xhr.onerror = function(e) {
				error && error("Błąd aktualizacji bazy danych." + e);
			}
			xhr.send();
		});
	};

	this.updateLocal = function() {
		FileRepo.withLocal(function(local) {
			self.db.transaction(function(tx) {
				tx.executeSql("UPDATE book SET _local=0", [], function(tx, results) {
					ll = local.length;
					var ids = [];
					for (var i = 0; i < ll; i ++) {
						ids.push(local[i].name);
					}
					ids = ids.join(',');
					tx.executeSql("UPDATE book SET _local=1 where id in ("+ids+")"); 
				});
			});
		}, function() {
			self.db.transaction(function(tx) {
				tx.executeSql("UPDATE book SET _local=0");
			});
		});
	};
}
