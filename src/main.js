if (process.env.test_cwd) process.chdir(process.env.test_cwd); // VERY important!

window.ace.require("ace/commands/multi_select_commands").keyboardHandler.bindKey("esc", null); // Remove the hotkey to exit multiple selection mode (Esc), it conflicts

var utils = require("./utils");

var api = {
	commands: {},
	addCommand: function(name, opts) {
		opts.name = name; // Let's add a key for the name as well, why the fuck not (this is for typeahead)
		api.commands[name] = opts;
	},
	editor: window.ace.edit("editor"),
	theme: "ace/theme/monokai",
	setTheme: function(theme) {
		this.theme = theme;
		split.setTheme(theme);
	},
	refreshTheme: function() {
		api.setTheme(api.theme);
	}
};

module.exports = api;

var split = require('./split.js').split;

var commands = require('./commands.js');
var popup = require('./popup.js');
var autocomplete = require('./autocomplete.js');
var filemanager = require('./filemanager.js');

utils.loadAceModule("ace/ext/language_tools");
api.editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
});

window.onresize = function() {
	split.resize();
};

api.refreshTheme();

window.nodeRequire = function(path) {
    return require(path);
};

require('./options.js').loadOptionsTree(process.cwd());

filemanager.updateFileCache();