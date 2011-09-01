
var History = new function() {
	var self = this;

	self.init = function(success, error) {
		console.log('History.init');

		self.viewStack = [];
		navigator.app.overrideBackbutton(); 
		document.addEventListener("backbutton", History.goBack, true);

		success && success();
	};

	self.visit = function(url, offset) {
		offset = offset || 0;
		self.viewStack.push(View.current);
		console.log('History.visit: ' + url);
		View.enter(url, offset);
	};
	
	self.goBack = function() {
		if (self.viewStack.length > 0) {
			var url = self.viewStack.pop();
			console.log('History.goBack: ' + url);
			View.enter(url);
		}
		else {
			console.log('History: exiting');
			navigator.app.exitApp();
		}
	};


	self.lastRead = function() {
		var last_read = window.localStorage.getItem('History.last_ids');
		try {
			return last_read.split(';');
		} catch (err) {
			return [];
		}
	};

	self.addRead = function(id, offset) {
		id = "" + id; // this should check if int
		console.log("History.addRead: " + id);
		var last_read = self.lastRead();
		var lastly = last_read.indexOf(id);
		if (lastly != -1) {
			last_read.splice(lastly, 1);
		}
		while (last_read.length >= 10) {
			last_read.pop();
		}
		last_read.unshift(id);
		window.localStorage.setItem('History.last_ids', last_read.join(';'));
	}


	self.bookmarks = function() {
		var bookmarks = window.localStorage.getItem('History.bookmarks');
		try {
			return JSON.parse(bookmarks) || [];
		} catch (err) {
			return [];
		}
	};

	self.addBookmark = function(name) {
		var id=(new Date).getTime();
		console.log("History.addBookmark: " + id);

		var bms = self.bookmarks();
		bms.unshift({
			id: id,
			name: name,
			title: View.currentTitle,
			view: View.currentView,
			par: View.currentPar,
			offset: currentOffset()
		});
		window.localStorage.setItem('History.bookmarks', JSON.stringify(bms));
	}

	self.deleteBookmark = function(id) {
		console.log("History.deleteBookmark: " + id);
		var bms = self.bookmarks();
		for (b in bms) {
			if (bms[b].id == id) {
				bms.splice(b, 1);
			}
		}
		window.localStorage.setItem('History.bookmarks', JSON.stringify(bms));
		View.onBookmarkChange();
	}
}
