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

require('./commands.js');
require('./popup.js');
require('./autocomplete.js');
require("./filemanager.js").updateFileCache();

utils.loadAceModule("ace/ext/language_tools");
api.editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
});

window.onresize = function() {
	split.resize();
}

api.refreshTheme();