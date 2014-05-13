var main = require("./main.js");
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
					expr.push(recurse(kws))
				}
			}
			return expr;
		}

		return recurse(keywords);
	},
	execute: function(keywords) {
		var sexpr = makeSexpr(keywords);
		var numberRegexp = new RegExp(/(\d+)([a-z]+)/);

		function recurse(expr) {
			for (var i = 1; i < expr.length; i++) {
				// Reduce expressions recursively
				var arg = expr[i];
				if (Object.prototype.toString.call(arg) === '[object Array]') {
					expr[i] = recurse(arg);
				}
			}
			var numberMatch = numberRegexp.exec(expr[0]);
			var repeat = 1;
			if (numberMatch) {
				repeat = parseInt(numberMatch[1]);
				expr[0] = numberMatch[2];
			}
			var cmd = main.commands[expr[0]];
			return cmd.action({
				editor: main.editor
				arguments: expr.slice(1),
				repeat: 1
			});
		}
	},
	typeMatchers: {
		// Which types can be used instead of a certain type?
		// For example, where a position is expected you can use both a position and a selection
		"text": ["text"],
		"cursor": ["cursor"],
		"action": ["action"],
		"any": ["text", "cursor", "action"],
		"start": ["text", "cursor", "action"] // What's valid at the start of a command
	}
}