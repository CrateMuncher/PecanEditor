var addCommand = require("./main.js").addCommand;
var utils = require("./utils.js");

/*
	Available types:
		text: Just plain text, either in quotes or not
		position: Any one cursor position
		positions: One or more cursor positions
		selection: Any one cursor position pair (start/end)
		selections: One or more position pairs (start/end)
		action: A command that does something, doesn't have a value
*/

addCommand("nl", {
	description: "Next Line",
	type: "cursor",
	arguments: [],
	action: function(editor) {
		window.alert(editor.getSession().getSelection());
	}
});

addCommand("pl", {
	description: "Previous Line",
	type: "cursor",
	arguments: [],
	action: function(editor) {
		return [
		];
	}
})

addCommand("cl", {
	description: "Change Language",
	type: "action",
	arguments: [
		{
			name: "language",
			type: "text",
			/*autocomplete: function(query) {
				var modeList = utils.loadAceModule("ace/ext/modelist");
				console.log(modeList);
			}*/
		}
	],
	action: function(editor, args) {
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
	]
});