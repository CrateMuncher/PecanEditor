var lipsum = require("lorem-ipsum");
var utils = require("./utils.js");
var glob = require("glob");
var main = require("./main.js");
var _ = require("lodash");

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
			type: "text"
		}
	],
	action: function(opts) {
		var count = parseInt(opts.arguments[0]) || 1;
		return lipsum({
			count: count
		});
	}
});