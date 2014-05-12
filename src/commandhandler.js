var main = require("./main.js");
module.exports = {
	makeSexpr: function(query) {
		var keywords = query.match(/\w+|"(?:\\"|[^"])+"/g); // One helluva regex

		// I can't really explain this bit
		function recurse(kws) {
			var expr = [kws.shift()];
			var cmd =  main.commands[expr[0]];
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
	execute: function(query) {

	},
	typeMatchers: {
		// Which types can be used instead of a certain type?
		// For example, where a position is expected you can use both a position and a selection
		"text": [],
		"position": ["position", "selection"],
		"selection": ["selection"],
		"positions": ["position", "selection", "positions", "selections"],
		"selections": ["selection", "selections"],
		"action": ["action"]
	}
}