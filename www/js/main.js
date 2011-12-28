/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var WL = 'http://www.wolnelektury.pl';


// disable debugging
//debug = function(text) {};
debug = function(text) {console.log(text);};


function onLoad() {
	debug('onLoad');
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	debug('onDeviceReady');

	var error = function(err) { alert(err); };

	FileRepo.init(function() {
		debug('after FileRepo.init');
		Catalogue.init(function() {
			debug('after catalogue.init');
			History.init(function() {
				debug('after history.init');
				View.init(function() {
					Menu.init(function() {
						View.go();
						Catalogue.sync(function() {
							Catalogue.updateLocal();
						}, error);
					}, error);
				}, error);
			}, error);
		}, error);
	});
}


var currentOffset = function() {
	var scr = document.body.scrollTop;
	var h = document.getElementById('nothing').offsetTop;
	return scr/h;
};

var setOffset = function(offset) {
	var h = document.getElementById('nothing').offsetTop;
	setTimeout(function() {scroll(0, h*offset); }, 10);
};


var prettySize = function(size) {
    if (!size) return "";
    var units = ['B', 'KiB', 'MiB', 'GiB'];
    size = size;
    var unit = units.shift();
    while (size > 1000 && units.length) {
        size /= 1024;
        unit = units.shift();
    }
    if (size < 10) {
        return Math.round(size*10)/10 + ' ' + unit;
    }
    return Math.round(size) + ' ' + unit;
};

