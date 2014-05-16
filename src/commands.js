var lipsum = require("lorem-ipsum");
var utils = require("./utils.js");
var glob = require("glob");
var main = require("./main.js");
var split = require("./split.js").split;
var _ = require("lodash");

var ThemeList = utils.loadAceModule("ace/ext/themelist");
var ModeList = utils.loadAceModule("ace/ext/modelist");
var Split = utils.loadAceModule("ace/ext/split").Split;

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
			opts.cursors[i].moveBy(1, 0);
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
			opts.cursors[i].moveBy(-1, 0);
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
				fuse: {
					keys: ["name"],
					threshold: 0.2
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
				fuse: {
					keys: ["name", "type"],
					threshold: 0.2
				}
			}
		}
	],
	action: function(opts) {
		var name = opts.arguments[0];
		var theme = ThemeList.themesByName[name];
		if (!theme) return;
		utils.loadAceModule(theme.theme); // Just to make sure it's loaded
		main.editor.setTheme(theme.theme);
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
	arguments: [
		{
			name: "count",
			type: "text",
		}
	],
	action: function(opts) {
		var count = parseInt(opts.arguments[0]) || 1;
		return lipsum({
			count: count
		});
	}
});

addCommand("s", {
	"description": "Split the screen",
	"type": "action",
	arguments: [
		{
			name: "direction",
			type: "text",
			autocomplete: {
				matching: true,
				run: function(query) {
					return _.map(["horizontal", "vertical"], function(dir) {
						return {
							value: dir,
							name: dir
						}
					});
				},
				fuse: {
					keys: ["name"]
				}
			}
		},
		{
			name: "count",
			type: "text",
		}
	],
	action: function(opts) {
		var direction = (opts.arguments[0] == "vertical") ? split.BELOW : split.BESIDE;
		var count = parseInt(opts.arguments[1]) || 1;

		split.setOrientation(direction);
		split.setSplits(count);

		main.setTheme(main.theme);
	}
});

addCommand("ss", {
	"description": "Select a specific screen split",
	"type": "action",
	arguments: [
		{
			name: "index",
			type: "text",
		}
	],
	action: function(opts) {
		var idx = parseInt(opts.arguments[0]) || 0;
		split.getEditor(idx).focus();
	}
});

addCommand("sn", {
	"description": "Select the next (down/right) split",
	"type": "action",
	arguments: [],
	action: function(opts) {
		var idx = split.$editors.indexOf(split.getCurrentEditor());
		var newIdx = idx + 1;
		if (newIdx > split.getSplits() - 1) newIdx = 0;
		if (newIdx < 0) newIdx = split.getSplits() - 1;
		split.getEditor(newIdx).focus();
	}
});

addCommand("sp", {
	"description": "Select the previous (up/left) split",
	"type": "action",
	arguments: [],
	action: function(opts) {
		var idx = split.$editors.indexOf(split.getCurrentEditor());
		var newIdx = idx - 1;
		if (newIdx > split.getSplits() - 1) newIdx = 0;
		if (newIdx < 0) newIdx = split.getSplits() - 1;
		split.getEditor(newIdx).focus();
	}
});

