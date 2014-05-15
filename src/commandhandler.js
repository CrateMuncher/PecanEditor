var main = require("./main.js");
var _ = require("lodash");

module.exports = {
	splitQuery: function(query) {
		return query.match(/\w+|"(?:\\"|[^"])+"/g); // Split on spaces, but not inside quotes
	},
	makeSexpr: function(keywords) {
		// I can't really explain this bit
		function recurse(kws) {
			var expr = [kws.shift()];
			var cmd = main.commands[expr[0]];
			if (!cmd) {
				return expr;
			}
			while (expr.length <= cmd.arguments.length) {
				var arg = cmd.arguments[expr.length-1];
				if (kws.length <= 0) {
					 return expr; // Quit early if there are no more keywords
				}
				if (arg.type == "text") {
					expr.push(kws.shift());
				} else {
					expr.push(recurse(kws));
				}
			}
			return expr;
		}

		return recurse(keywords);
	},
	execute: function(keywords) {
		var me = this;
		var sexpr = this.makeSexpr(keywords);
		var numberRegexp = new RegExp(/(\d+)([a-z]+)/);

		function recurse(expr) {
			for (var i = 1; i < expr.length; i++) {
				// Reduce expressions recursively
				var arg = expr[i];
				if (Object.prototype.toString.call(arg) === '[object Array]') {
					expr[i] = recurse(arg);
					//if (!expr[i]) return;
				}
			}
			var numberMatch = numberRegexp.exec(expr[0]);
			var repeat = 1;
			if (numberMatch) {
				repeat = parseInt(numberMatch[1]);
				expr[0] = numberMatch[2];
			}
			var cmd = main.commands[expr[0]];
			if (!cmd) return;
			//var oldCursors = me.cloneCursors();
			var ret = cmd.action({
				editor: main.editor,
				arguments: _.map(expr.slice(1), function(arg) {
					return arg.replace(/\"/g, "")
				}),
				repeat: repeat,
				cursors: main.editor.getSelection().getAllRanges()
			});
			/*if (!ret) {
				// This part allows in-place editing of cursors without breaking the "flow" of commands
				// It lets the command edit the cursors, but it reverts them to their old state afterwards
				// But still keeps the changes and returns them
				// Why? Ace has many neat utility functions (like find/replace, split into lines, etc) that edit the selections directly
				var newCursors = me.cloneCursors();
				me.setCursorPositions(oldCursors);
				return newCursors;
			} else {*/
				return ret;
			//}
		}

		var retval = recurse(sexpr);
		var firstCommand = main.commands[sexpr[0]];
		if (!firstCommand) return;
		if (!retval) return;
		if (firstCommand.type == "text") {
			main.editor.insert(retval);
		} else if (firstCommand.type == "cursor") {
			this.setCursorPositions(retval);
		}
	},
	typeMatchers: {
		// Which types can be used instead of a certain type?
		"text": ["text"],
		"cursor": ["cursor"],
		"action": ["action"],
		"any": ["text", "cursor", "action"],
		"start": ["text", "cursor", "action"] // What's valid at the start of a command
	},
	setCursorPositions: function(ranges, add) {
		if (!add) {
			main.editor.exitMultiSelectMode();
			main.editor.getSelection().setRange(ranges[0]);
		}
		if (ranges.length > 1) {
			for (var i = 0; i < ranges.length; i++) {
				main.editor.getSelection().addRange(ranges[i]);
			}
		}
		main.editor.getSelection()._emit("changeSelection");
	},
	cloneCursors: function() {
		return _.map(main.editor.getSelection().getAllRanges(), function(cursor) { return cursor.clone(); });
	}
}