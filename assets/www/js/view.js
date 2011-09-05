/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var View = new function() {
	var self = this;
	//self.minOffset = 1000;
	self.categories = {
			autor: 'Autorzy', 
			rodzaj: 'Rodzaje',
			gatunek: 'Gatunki',
			epoka: 'Epoki'
	};
	self.category_msc = {
		autor: 'autorze',
		rodzaj: 'rodzaju',
		gatunek: 'gatunku',
		epoka: 'epoce'
	};
	

	self.init = function(success, error) {
		console.log('View.init');

		self._searchbox = document.getElementById("searchbox");
		self._searchinput = document.getElementById("search");
		self._content = document.getElementById("content");

		self.current = '';
		self.currentView = '';
		self.currentPar = '';
		self.currentTitle = '';

		document.getElementById("cover").style.display = 'none';
		self.enter('');

		success && success();
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
		self._content.innerHTML = "<div class='spinner'><img src='img/spinner.gif' /><div id='spinnertext'>" + text +"</div></div>";
		setOffset(0);
	};

	this.content = function(text, offset) {
		console.log('content');

		self._content.innerHTML = '';
		self._content.innerHTML = text;
		setOffset(offset);
	}

	this.enter = function(url, offset) {
		console.log('View.enter: ' + url);

		var view = 'Index';
		var arg = null;

		if (url.length) {
			var slash_index = url.indexOf('/');
			if (slash_index != -1) {
				view = url.substr(0, slash_index);
				arg = url.substr(slash_index + 1);
			}
			else {
				view = url;
			}
		}
		console.log('View.enter: ' + view + ' ' + arg);
		self.current = url;
		self.currentView = view;
		self.currentPar = arg;
		self['enter' + view](arg, offset);
	}
	
	this.enterIndex = function(arg, offset) {
		console.log('enterIndex');
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.showSearch();
		self.currentTitle = "Początek";
		var html = "";

		html += "<div class='buttons'>";
		html += Links.button('Last', '', 'Ostatnio czytane');
		html += Links.button('Bookmarks', '', 'Zakładki');

		for (category in self.categories)
			html += Links.button('Category', category, self.categories[category], 0);
		html += "</div>";
		
		html += "</div>" +"";
				/*"<p id='logo'><img src='img/logo-wl-nq8.png' alt='Wolne Lektury' /><br/>\n" +
				"szkolna biblioteka internetowa" +
				"</p>";*/
		self.content(html, offset);
	};
	
	this.enterBook = function(id, offset) {
		id = parseInt(id);
		console.log('enterBook: ' + id);
		Menu.setInfoButton("BookInfo", "Informacje o utworze", true);
		self.showSearch();

		Catalogue.withBook(id, function(book) {
			self.currentTitle = book.authors + ', ' + book.title;

			Catalogue.withChildren(id, function(children) {
				var html = "<h1><span class='subheader'>";
				html += book.authors;
				html += "</span>" + book.title + "</h1>\n";
				if (book.html_file) {
					html += "<div class='buttons'>" + Links.button('BookText', id, "Czytaj tekst") + "</div>";
				}
				if (children.length) {
					html += "<div class='buttons'>";
					for (c in children) {
						child = children[c];
						html += Links.bookLink(child);
					}
					html += "</div>";
				}
				self.content(html, offset);				
			});
		}, function() {
			History.goBack();
		});
	};
	
	this.enterBookText = function(id, offset) {
		self.hideSearch();
		self.spinner("Otwieranie utworu");
		console.log('enterBookText: ' + id);
		Menu.setInfoButton("BookInfo", "Informacje o utworze", true);
		id = parseInt(id);

		setTimeout("History.addRead("+id+");", 0);
		
		FileRepo.withHtml(id, function(data) {
			self.content(data, offset);
		}, function(err) {
			alert("Błąd pobierania: nie udało się pobrać treści utworu.");
			History.goBack();
		});
		Catalogue.withBook(id, function(book) {
			self.currentTitle = book.authors + ', ' + book.title;
		});
	};


	this.enterLast = function(ignored, offset) {
		console.log("enterLast");
		self.showSearch();
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.currentTitle = 'Ostatnio czytane';
		var html = "<h1><span class='subheader'>Ostatnio czytane</h1>\n";

		var last_read = History.lastRead();
		var some_books = false;

		html += "<div class='buttons'>";
		var add_books = function() {
			if (last_read.length) {
				var id = last_read.shift();
				Catalogue.withBook(id, function(book) {
					html += Links.bookLink(book);
					some_books = true;
					add_books();
				}, function() {
					add_books();
				});
			}
			else {
				if (!some_books) {
					html += "<p>Nie przeczytano żadnych utworów.</p>";
				}
				html += "</div>";
				self.content(html, offset);
			}
		};
		add_books();
	};


	this.enterBookmarks = function(ignored, offset) {
		console.log("enterBookmarks");
		self.showSearch();
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.currentTitle = 'Zakładki';
		var html = "<h1><span class='subheader'>Zakładki</h1>\n";

		var bookmarks = History.bookmarks();
		if (!bookmarks.length) {
			html += "<p>Nie utworzono żadnych zakładek.</p>";
			self.content(html, offset);
			return;
		}

		html += "<div class='buttons bookmarks'>";
		for (i in bookmarks) {
			var bm = bookmarks[i];

			var text = bm.name;
			text += "<div class='sub'>" + bm.title + "</div>";
			html += Links.deleteButton(bm.id);
			html += Links.button(bm.view, bm.par, text, bm.offset);
		}
		html += "</div>";
		self.content(html, offset);
	};

	this.onBookmarkChange = function() {
		// TODO: preserve offset
		if (self.currentView == 'Bookmarks') {
			self.enterBookmarks();
		}
	};

	this.enterTag = function(id, offset) {
		id = parseInt(id);
		console.log('enterTag: ' + id);
		Menu.setInfoButton("TagInfo", "Informacje o...", true);
		self.showSearch();

		self.spinner("Otwieranie listy utworów");

		Catalogue.withTag(id, function(tag) {
			Menu.setInfoButton("TagInfo", "Informacje o " + self.category_msc[tag.category], true);
			self.currentTitle = tag.category + ': ' + tag.name;
			var html = "<h1><span class='subheader upper'>" + tag.category + ': </span>' + tag.name + "</h1>\n";
			html += "<div class='buttons'>";
			if (tag.books) {
				Catalogue.withBooks(tag.books, function(books) {
					for (var i in books) {
						var book = books[i];
						html += Links.bookLink(book);
					}
					html += "</div>";
					self.content(html, offset);
				});
			}
		}, function() {
			History.goBack();
		});
	};


	this.enterCategory = function(category, offset) {
		console.log('enterCategory: ' + category);
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.spinner("Otwieranie katalogu");
		self.showSearch();
		self.currentTitle = self.categories[category];

		Catalogue.withCategory(category, function(tags) {
			var html = "<h1>" + self.categories[category] + "</h1>\n";
			html += "<div class='buttons'>";
			for (i in tags) {
				tag = tags[i];
				html += Links.button('Tag', tag.id, tag.name);
			}
			html += "</div>";
			self.content(html, offset);
		});
	};


	this.enterSearch = function(query, offset) {
		console.log('enterSearch: ' + query);
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.currentTitle = 'Szukaj: ' + query;
		self.showSearch();

		var html = "<h1><span class='subheader'>Szukana fraza:</span>" + View.sanitize(query) + "</h1>\n";

		if (query.length < 2) {
			html += "<p>Szukana fraza musi mieć co najmniej dwa znaki</p>";
			self.content(html, offset);
			return;
		}

		Catalogue.withSearch(query, function(results) {
			if (results.length == 1) {
			    var result = results[0];
			    if (result.view == 'Book' && result.item.html_file) {
			    	self.enter(Links.href('BookText', result.item.id));
			    }
			    else {
					self.enter(Links.href(result.view, result.item.id));
				}
				return;
			}
			if (results.length == 0) {
				html += "<p>Brak wyników wyszukiwania</p>";
			}
			else {
				html += "<div class='buttons'>";
				for (var i in results) {
					var result = results[i];
					if (result.view == 'Book')
						html += Links.bookLink(result.item)
					else
						html += Links.button(result.view, result.item.id, result.item.name+"<div class='sub'>"+result.item.category+"</div>");
				}
				html += "</div>";
			}
			self.content(html, offset);
		});
	};


	/* info */

	this.enterProjectInfo = function(arg, offset) {
		console.log('enterProjectInfo');
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", false);
		self.hideSearch();
		self.currentTitle = "Informacje o projekcie";

		var html = "";

		html += '<div class="info">';


		html += "<p style='text-align:center'><img src='img/logo-wl.png' /></p>";
		html += "<p>Biblioteka internetowa Wolne Lektury "+
" udostępnia w swoich zbiorach lektury szkolne zalecane do użytku przez" + 
" Ministerstwo Edukacji Narodowej i inne dzieła literatury.</p>";

		html += "<p style='text-align:center'><img src='img/logo-fnp.png' /></p>";

		html += "<img style='float:left;' src='img/procent.png' />" +
			"<p style='margin-left: 50px'>" + 
			"Przekaż 1% podatku na rozwój Wolnych Lektur.<br/>" +
			"Fundacja Nowoczesna Polska<br/>" +
			"KRS 0000070056</p>";

		html += "<p>Większość pozycji w bibliotece należy do domeny publicznej "+
			"co oznacza, że nie są już chronione majatkowym prawem autorskim, "+
			"a więc można je swobodnie wykorzystywać, publikować i rozpowszechniać. "+
			"Publikujemy również kilka utworów, które autorzy udostępnili na wolnej licencji "+
			"<a href='http://creativecommons.org/licenses/by-sa/3.0/deed.pl'>"+
			"Creative Commons Uznanie Autorstwa - Na Tych Samych Warunkach 3.0.PL</a>.</p>";

		html += "<p style='text-align:center'><img src='img/cc-by-sa.png' /></p>";

		html += "<p>Copyright © 2011 Fundacja Nowoczesna Polska. Aplikacja jest wolnym oprogramowaniem "+
				"dostępnym na licencji GNU Affero GPL w wersji 3 lub późniejszej.</p>";

		html += "<p>Więcej informacji o projekcie znajduje sie na stronie <a href='http://www.wolnelektury.pl'>http://www.wolnelektury.pl</a>.</p>";

		html += '</div>';


		self.content(html, offset);
	};
	
	
	this.enterBookInfo = function(id, offset) {
		id = parseInt(id);
		console.log('enterBookInfo: ' + id);
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.hideSearch();

		Catalogue.withBook(id, function(book) {
			self.currentTitle = "Informacje o: " + book.title;

			var html = '<h2>' + book.authors + ', ' + book.title + '</h2>';

			var url = WL + '/api/book/' + id + '/info.html';

			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.onload = function() {
				console.log('BookInfo: fetched by ajax: ' + url);

				html += '<div class="info">';
				html += xhr.responseText;
				html += '</div>';

				self.content(html, offset);
			}
			xhr.onerror = function(e) {
				self.content("Brak informacji.", offset);
			}
			xhr.send();
		}, function() {
			History.goBack();
		});
	};


	this.enterTagInfo = function(id, offset) {
		id = parseInt(id);
		console.log('enterTagInfo: ' + id);
		Menu.setInfoButton("ProjectInfo", "Informacje o projekcie", true);
		self.hideSearch();

		Catalogue.withTag(id, function(tag) {
			self.currentTitle = "Informacje o " + tag.name;
			var html = '<h2>' + tag.name + '</h2>';

			var url = WL + '/api/tag/' + id + '/info.html';

			var xhr = new XMLHttpRequest();
			xhr.open("GET", url);
			xhr.onload = function() {
				console.log('TagInfo: fetched by ajax: ' + url);

				html += '<div class="info">';
				html += xhr.responseText;
				html += '</div>';

				self.content(html, offset);
			}
			xhr.onerror = function(e) {
				self.content("Brak informacji.", offset);
			}
			xhr.send();
		}, function() {
			History.goBack();
		});
	};


	/* search form submit callback */
	this.search = function() {
		History.visit('Search/' + self._searchinput.value);
		return false;
	}
	
	

}
