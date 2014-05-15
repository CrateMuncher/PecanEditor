window.ace.require("ace/commands/multi_select_commands").keyboardHandler.bindKey("esc", null); // Remove the hotkey to exit multiple selection mode (Esc), it conflicts

var editor = window.ace.edit("editor");
var utils = require("./utils");

var api = {
	commands: {},
	addCommand: function(name, opts) {
		opts.name = name; // Let's add a key for the name as well, why the fuck not (this is for typeahead)
		api.commands[name] = opts;
	},
	editor: editor
};

utils.loadAceModule("ace/ext/language_tools");
editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    enableSnippets: true
});

module.exports = api;

require('./commands.js');
require('./popup.js');
require('./autocomplete.js');

editor.setTheme("ace/theme/monokai");