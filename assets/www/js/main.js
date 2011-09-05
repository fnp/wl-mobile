/*
 * This file is part of WolneLektury-Mobile, licensed under GNU Affero GPLv3 or later.
 * Copyright © Fundacja Nowoczesna Polska. See NOTICE for more information.
 */

var VERSION = '1.0';
var WL = 'http://www.wolnelektury.pl';


// disable debugging
console.log = function(text) {};


function onLoad() {
	console.log('onLoad');
	document.addEventListener("deviceready", onDeviceReady, false);
}

function onDeviceReady() {
	console.log('onDeviceReady');
	var error = function(err) { alert(err); };

	FileRepo.init(function() {
		console.log('after FileRepo.init');
		Catalogue.init(function() {
			console.log('after catalogue.init');
			History.init(function() {
				console.log('after history.init');
				View.init(function() {
					Catalogue.sync(function() {
						Catalogue.updateLocal();
					}, error);
				}, error);
			}, error);
		}, error);
	});
}


var currentOffset = function() {
	var scr = document.body.scrollTop;
	var h = document.getElementById('nothing').offsetTop;
	return scr/h;document.getElementById('nothing')
};

var setOffset = function(offset) {
	var h = document.getElementById('nothing').offsetTop;
	scroll(0, h*offset); 
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
