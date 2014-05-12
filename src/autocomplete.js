var $ = window.$;
var main = require("./main.js");
var ch = require("./commandhandler.js");
var _ = require("lodash");

var commandMatcher = function(cmds) {
	return function(q, cb) {
		var matches, substrRegex;
		matches = [];
		//var qSplit = q.split(" ");

		//substrRegex = new RegExp(qSplit[qSplit.length-1], 'i');

		var activeCommand = ch.makeSexpr
		if ()
		$.each(cmds, function(i, cmd) {
			if (substrRegex.test(cmd.name)) {
				matches.push(cmd);
			} else {
				if (substrRegex.test(cmd.desc)) {
					matches.push(cmd);
				}
			}
		});
		
		cb(matches);
	};
};

$("#popup-input").typeahead({
	minLength: 0,
	highlight: false
}, {
	name: "cmds",
	displayKey: 'name',
	source: commandMatcher(main.commands),
	templates: {
		empty: '<div class="tt-suggestion"><span class="empty-message">No suggestions</span></div>',
		suggestion: window.Handlebars.compile('<span class="cmd-name"><strong>{{name}}</strong></span><span class="cmd-args">{{#each arguments}}{{this.type}} {{/each}}</span><span class="cmd-type"><small>{{type}}</small></span><br /><span class="cmd-desc">{{description}}</span>')
	}
});