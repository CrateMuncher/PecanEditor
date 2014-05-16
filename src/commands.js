var lipsum = require("lorem-ipsum");
var utils = require("./utils.js");
var main = require("./main.js");
var split = require("./split.js").split;
var _ = require("lodash");
var path = require("path");
var filemanager = require("./filemanager.js");
var exec_ = require("child_process").exec;

var ThemeList = utils.loadAceModule("ace/ext/themelist");
var ModeList = utils.loadAceModule("ace/ext/modelist");

var addCommand = main.addCommand;

/*
	Available types:
		text: Just plain text, either in quotes or not
		cursor: One or more cursor Ranges (Range is a type in Ace)
		action: A command that does something, doesn't have a value
*/

addCommand("nl", {
	description: "Next Line",
	type: "cursor",
	arguments: [],
	action: function(opts) {
		for (var i = 0; i < opts.cursors.length; i++) {
			opts.cursors[i].moveBy(opts.repeat || 1, 0);
		}
		return opts.cursors;
	}
});

addCommand("pl", {
	description: "Previous Line",
	type: "cursor",
	arguments: [],
	action: function(opts) {
		for (var i = 0; i < opts.cursors.length; i++) {
			opts.cursors[i].moveBy(-opts.repeat || -1, 0);
		}
		return opts.cursors;
	}
});

addCommand("cl", {
	description: "Change Language/Mode",
	type: "action",
	arguments: [
		{
			name: "language",
			type: "text",
			autocomplete: {
				matching: true,
				run: function(query) {
					var modes = ModeList.modes;
					return _.map(modes, function(mode) {
						return {
							value: mode.name,
							name: mode.caption
						}
					});
				},
				first: 5,
				fuse: {
					keys: ["name"],
					threshold: 0.2,
					shouldSort: true
				}
			}
		}
	],
	action: function(opts) {
		var name = opts.arguments[0];
		var mode = ModeList.modesByName[name];
		if (!mode) return;
		utils.loadAceModule(mode.mode); // Just to make sure it's loaded
		main.editor.getSession().setMode(mode.mode);
	}
});

addCommand("ct", {
	description: "Change Syntax/Editor Theme",
	type: "action",
	arguments: [
		{
			name: "theme",
			type: "text",
			autocomplete: {
				matching: true,
				run: function(query) {
					var themes = ThemeList.themes;
					return _.map(themes, function(theme) {
						return {
							value: theme.name,
							name: theme.caption,
							type: theme.isDark ? "dark" : "light"
						}
					});
				},
				first: 999,
				fuse: {
					keys: ["name", "type"],
					threshold: 0.2,
					shouldSort: true
				}
			}
		}
	],
	action: function(opts) {
		var name = opts.arguments[0];
		var theme = ThemeList.themesByName[name];
		if (!theme) return;
		utils.loadAceModule(theme.theme); // Just to make sure it's loaded
		main.setTheme(theme.theme);
	}
});

addCommand("d", {
	description: "Delete (Until)",
	type: "action",
	arguments: [
		{
			name: "end",
			type: "cursor"
		}
	],
	action: function(opts) {
	}
});

addCommand("li", {
	description: "Lorem Ipsum (garbage) text generator",
	type: "text",
	arguments: [],
	action: function(opts) {
		var count = parseInt(opts.repeat || 1);
		return lipsum({
			count: count
		});
	}
});

addCommand("s", {
	description: "Split the screen",
	type: "action",
	arguments: [
		{
			name: "direction",
			type: "text",
			autocomplete: {
				matching: true,
				run: function(query) {
					return _.map(["h", "v"], function(dir) {
						return {
							value: dir,
							name: dir
						}
					});
				},
				fuse: {
					keys: ["name"],
					shouldSort: true
				}
			}
		}
	],
	action: function(opts) {
		var direction = (opts.arguments[0] == "v") ? split.BELOW : split.BESIDE;
		var count = opts.repeat || 1;

		split.setOrientation(direction);
		split.setSplits(count);

		main.refreshTheme();
	}
});

addCommand("ss", {
	description: "Select a specific screen split",
	type: "action",
	arguments: [],
	action: function(opts) {
		var idx = opts.repeat || 0;
		split.getEditor(idx).focus();
	}
});

addCommand("ns", {
	description: "Select the next (down/right) split",
	type: "action",
	arguments: [],
	action: function(opts) {
		var idx = split.$editors.indexOf(split.getCurrentEditor());
		var newIdx = idx + (opts.repeat || 1);
		if (newIdx > split.getSplits() - 1) newIdx = 0;
		if (newIdx < 0) newIdx = split.getSplits() - 1;
		split.getEditor(newIdx).focus();
	}
});

addCommand("ps", {
	description: "Select the previous (up/left) split",
	type: "action",
	arguments: [],
	action: function(opts) {
		var idx = split.$editors.indexOf(split.getCurrentEditor());
		var newIdx = idx - opts.repeat;
		if (newIdx > split.getSplits() - 1) newIdx = 0;
		if (newIdx < 0) newIdx = split.getSplits() - 1;
		split.getEditor(newIdx).focus();
	}
});

addCommand("o", {
	description: "Open a file in the current editor",
	type: "action",
	arguments: [
		{
			name: "filename",
			type: "text",
			autocomplete: {
				run: function(query) {
					var matches = filemanager.getAllFiles();
					return _.map(matches, function(match) {
						var paths = match.split(path.sep);
						paths = paths.slice(-2);
						var displayVal = paths.join(path.sep);
						displayVal = displayVal.slice(-100);
						val = match;
						if (val.match(" ")) {
							val = "\"" + val + "\"";
						}
						return {
							name: path.basename(match),
							description: displayVal,
							type: ModeList.getModeForPath(match).caption,
							value: val
						}
					});
				},
				first: 5,
				matching: true,
				fuse: {
					keys: ["name"],
					shouldSort: true
				}
			}
		}
	],
	action: function(opts) {
		var filename = opts.arguments[0];
		filemanager.loadFileInto(filename);
	}
});

addCommand("cmd", {
	description: "Run terminal command",
	type: "action",
	arguments: [
		{
			name: "command",
			type: "text"
		}
	],
	action: function(opts) {
		var cmd = opts.arguments[0];

		for (var i = 0; i < (opts.repeat || 1); i++) {
			exec_(cmd);
		};
	}
});

// This doesn't work
/*addCommand("odt", {
	description: "Open WebKit development tools",
	type: "action",
	arguments: [],
	action: function(opts) {
		require('nw.gui').Window.get().showDevTools();
	}
});*/