/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var Links = new function() {
	var self = this;

	self.href = function(view, par) {
		return view+"/"+par;
	};

	self.button = function(view, par, text, offset) {
		offset = offset || 0;
		var html = "<div class='button button-"+view+"' onclick='History.visit(\"" + 
					self.href(view, par).replace(/["']/g, "\\$&") + "\", "+offset+");'>";
		icon = view;
		if (icon != 'Book' && icon != 'Bookmarks' && icon != 'BookText' && 
		        icon != 'Last' && icon != 'Tag') {
		    icon = 'Tag';
		}
		html += "<img src='img/icon-" + icon + ".png' />";
		html += "<div class='label'>" + text + "</div>";
		html += "<div class='clr'></div>";
		html += "</div>\n";
		return html; 
	};

	self.bookLink = function(book) {
		var target = 'Book';
		var note = '';

		if (book.html_file) {
			// this assumes that either book has a html XOR it has children
			target = 'BookText';
			note = "<div class='note'>";
			if (book._local)
				note += 'Pobrane';
			else {
				note += book.pretty_size;
			}
			note += "</div>";
		}

		return self.button(target, book.id,
				"<div class='sub'>" + book.authors + "</div>" +
				book.title + note);
	};

	self.deleteButton = function(id) {
		return "<div class='delete' onClick='History.deleteBookmark(\""+id+"\");'>x</div>";
	};
}
