var editor = window.ace.edit("editor");

var api = {
	commands: {},
	addCommand: function(name, opts) {
		opts.name = name; // Let's add a key for the name as well, why the fuck not (this is for typeahead)
		api.commands[name] = opts;
	},
	handleCommand: function(cmd) {
	},
	editor: editor
};

module.exports = api;

window.ace.require(["ace/ace", "ace/ext/statusbar"], function(ace) {
    console.log(ace.require("ace/ext/statusbar"));
});

require('./commands.js');
require('./popup.js');
require('./autocomplete.js');

editor.setTheme("ace/theme/monokai");