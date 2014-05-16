var main = require("./main.js");
var fs = require("fs");
var split = require("./split.js").split;
var utils = require("./utils.js");
var glob = require("glob");
var path = require("path");
var watch = require("watch");
var _ = require("lodash");

var ModeList = utils.loadAceModule("ace/ext/modelist");
var Document = window.ace.require("ace/document").Document;

var cache;

module.exports = {
	files: {},
	loadFileInto: function(filename, idx) {
		filename = path.normalize(process.cwd() + path.sep + filename);
		idx = idx || split.$editors.indexOf(split.getCurrentEditor());
		var me = this;
		if (!fs.existsSync(filename)) {
		    var fd = fs.openSync(filename, 'a');
		    fs.closeSync(fd);
		}
		fs.readFile(filename, 'utf8', function (err,data) {
		  	if (err) {
		    	return err;
		  	}
		  	var mode = ModeList.getModeForPath(filename).mode || "";
		  	var file = me.files[filename];
		  	if (!file) {
		  		file = {
		  			filename: filename,
		  			index: idx
		  		};
		  	}
		  	var doc = file.doc;
		  	if (doc) {
		  		if (doc.getValue() !== data) {
		  			doc.setValue(data);
		  		}
		  	} else {
		  		doc = new Document(data);
		  		file.doc = doc;
		  	}

		  	var oldSession = split.$editors[idx];
		  	var oldSessionData = me.getFileDataForSession(oldSession);
		  	if (oldSessionData) {
		  		files[oldSessionData.filename] = undefined;
		  		doc.removeListener("change", oldSessionData.listenCallback);
		  	}

		  	var newSession = window.ace.createEditSession(doc, mode);
		  	file.session = split.setSession(newSession, idx);
		  	me.files[filename] = file;

		  	var listenCallback = function() {
		  		me.saveSession(file.session);
		  	};
		  	doc.on("change", listenCallback);
		  	fs.watch(filename, { persistent: false }, function(evt, name) {
		  		var timeDelta = new Date() - file.lastChange;
		  		if (timeDelta > 100) {
		  			console.log("hai");
		  			fs.readFile(filename, 'utf8', function (err, data) {
		  				console.log("hai");
		  				console.log(err);
		  				if (err) {
		  					return err;
		  				}
		  				doc.setValue(data);
		  			});
		  		}
		  	});
		});
	},
	saveSession: function(session) {
		var data = this.getFileDataForSession(session);
		fs.writeFile(data.filename, data.doc.getValue()); 
		data.lastChange = new Date();
	},
	getFileDataForSession: function(session) {
		return _.find(this.files, function(f) {
			return f.session === session;
		});
	},
	getAllFiles: function() {
		if (cache) {
			return cache;
		} else {
			this.updateFileCache();
			cache;
		}
	},
	updateFileCache: function() {
		cache = glob.sync("**/*");
		return cache;
	}
};

watch.watchTree(process.cwd(), function(f, curr, prev) {
    if (prev === null) {
        module.exports.updateFileCache();
    }
});