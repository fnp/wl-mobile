
var Menu = new function() {
	var self = this;
	var infoView = "ProjectInfo";

	self.start = function() {
		History.visit('');
	};

	self.info = function() {
		History.visit(self.infoView + '/' + View.currentPar);
	};

	self.bookmark = function() {
		var name = prompt('Nazwa zakładki');
		if (name != null)
			History.addBookmark(name);
	};

	self.setInfoButton = function(view, label, enabled) {
		self.infoView = view;
		window.MenuInterface.setInfoButton(label, enabled);
	};
}
