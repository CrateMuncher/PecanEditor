var $ = window.$;
var main = require("./main.js");
var ch = require("./commandhandler.js");
var _ = require("lodash");

var deepGetLastList = function(list) {
	if (Object.prototype.toString.call(list[list.length-1]) === '[object Array]') { // JavaScript, why is checking if an object is an array so hard? Fuck you, Brendan Eich.
		return deepGetLastList(list[list.length-1]);
	} else {
		return list;
	}
};

var deepGetLastListsParent = function(list, parent) {
	if (Object.prototype.toString.call(list[list.length-1]) === '[object Array]') {
		return deepGetLastListsParent(list[list.length-1], list);
	} else {
		return parent;
	}
};

var commandTemplate = window.Handlebars.compile('<span class="cmd-name"><strong>{{name}}</strong></span><span class="cmd-args">{{#each arguments}}{{this.type}} {{/each}}</span><span class="cmd-type"><small>{{type}}</small></span><br /><span class="cmd-desc">{{description}}</span>');
var plainTextPlaceholderTemplate = window.Handlebars.compile('<span class="empty-message">Text string</span>');
var stringTemplate = window.Handlebars.compile('{{string}}');
var noSuggestionsTemplate = window.Handlebars.compile('<span class="empty-message">No suggestions</span>');

var autocompleteCommand = function(type, query) {
	var possibleTypes = ch.typeMatchers[type];

	var fittingCommands = [];
	_.forEach(main.commands, function (cmd) {
		if (_.contains(possibleTypes, cmd.type)) {
			fittingCommands.push(cmd);
		}
	});
	var matchRegex = new RegExp(query);
	var matchingCommands = [];
	_.forEach(fittingCommands, function (cmd) {
		if (matchRegex.test(cmd.name)) {
			matchingCommands.push(cmd);
		}
	});
	_.forEach(fittingCommands, function (cmd) {
		if (matchRegex.test(cmd.description) && !_.contains(fittingCommands, cmd)) {
			matchingCommands.push(cmd);
		}
	});
	return matchingCommands;
}

var commandMatcher = function() {
	return function(q, cb) {
		var splitQuery = ch.splitQuery(q) || [""];
		if (!splitQuery || splitQuery.length == 1) {
			// Start of the command
			var matchingCommands = autocompleteCommand("start", splitQuery[0]);
			var matchStrings = _.map(matchingCommands, function (cmd) {
				return commandTemplate(cmd);
			});
			cb(matchStrings);
			return;
		}
		var sexpr = ch.makeSexpr(splitQuery);
		var commandSexpr = deepGetLastList(sexpr);

		var command = main.commands[commandSexpr[0]];
		if (commandSexpr.length <= 1) {
			commandSexpr = deepGetLastListsParent(sexpr);
			if (!commandSexpr) {
				cb([noSuggestionsTemplate()]);
				return;
			}
			command = main.commands[commandSexpr[0]];
		}
		if (!command) {
			cb([noSuggestionsTemplate()]);
			return;
		}
		var argument = command.arguments[commandSexpr.length - 2];
		if (!argument) {
			cb([noSuggestionsTemplate()]);
			return;
		}
		if (argument.autocomplete) {
			cb(argument.autocomplete(commandSexpr[commandSexpr.length-1]));
		} else {
			//window.alert(JSON.stringify(argument));
			if (argument.type == "text") {
				cb([plainTextPlaceholderTemplate()]);
				return;
			} else {
				var matchingCommands = autocompleteCommand(argument.type, commandSexpr[commandSexpr.length-1]);
				var matchStrings = _.map(matchingCommands, function (cmd) {
					return commandTemplate(cmd);
				});
				cb(matchStrings);
				return;
			}
		}
	};
};

$("#popup-input").typeahead({
	minLength: 0,
	highlight: false
}, {
	name: "cmds",
	displayKey: 'name',
	source: commandMatcher(),
	templates: {
		empty: '<div class="tt-suggestion">' + noSuggestionsTemplate() + '</div>',
		suggestion: function(str) { return str; }
	}
});