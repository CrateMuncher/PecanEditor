var $ = window.$;
var main = require("./main.js");
var ch = require("./commandhandler.js");
var utils = require("./utils.js");
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

var commandTemplate = window.Handlebars.compile('<span class="empty-message">{{emptyMessage}}</span><span class="plain-text">{{plainText}}</span><span class="commandString">{{commandString}}</span><span class="cmd-name"><strong>{{name}}</strong></span><span class="cmd-args">{{#each arguments}}{{this.type}} {{/each}}</span><span class="cmd-type"><small>{{type}}</small></span><br /><span class="cmd-desc">{{description}}</span>');

var autocompleteCommand = function(type, query) {
	if (Object.prototype.toString.call(query) === '[object Array]') {
		query = query[0];
	}
	var possibleTypes = ch.typeMatchers[type];

	var fittingCommands = [];
	_.forEach(main.commands, function (cmd) {
		if (_.contains(possibleTypes, cmd.type)) {
			fittingCommands.push(cmd);
		}
	});
	var options = {
		keys: ["name", "type", "description"],
		sort: true
	}
	var fuse = new window.Fuse(fittingCommands, options);
	var res = fuse.search(query);
	return res;
}

var commandMatcher = function() {
	return function(q, cb) {
		var splitQuery = ch.splitQuery(q) || [""];

		var sexpr = ch.makeSexpr(splitQuery.slice(0)); // Clone the array, makeSexpr modifies it in-place
		var commandSexpr = deepGetLastList(sexpr);

		var commandName = commandSexpr[0];

		commandName = ch.splitCommand(commandName)[1];

		if (!sexpr || sexpr.length == 1) {
			// Start of the command
			var matchingCommands = autocompleteCommand("start", splitQuery[0]);
			cb(_.map(matchingCommands, function(cmd) {
				cmd.value = cmd.name;
				return cmd;
			}));
			return;
		}

		var command = main.commands[commandName];
		if (commandSexpr.length <= 1) {
			commandSexpr = deepGetLastListsParent(sexpr);
			if (!commandSexpr) {
				cb([]);
				return;
			}
			command = main.commands[commandSexpr[0]];
		}
		if (!command) {
			cb([]);
			return;
		}
		var argument = command.arguments[commandSexpr.length - 2];
		if (!argument) {
			cb([]);
			return;
		}
		if (argument.autocomplete) {
			if (!argument.autocomplete.matching) {
				cb(_.map(argument.autocomplete.run(commandSexpr[commandSexpr.length-1]), function(item) {
					return {
						commandString: item,
						value: item
					}
				}));
			} else {
				var options = argument.autocomplete.fuse || {};
				var results = argument.autocomplete.run(commandSexpr[commandSexpr.length-1]);
				var fuse = new window.Fuse(results, options);
				var res = fuse.search(commandSexpr[commandSexpr.length-1]);

				res = _.map(res, function(entry) {
					entry.value = utils.replaceLast(q, commandSexpr[commandSexpr.length-1], entry.value);
					return entry;
				});
				cb(res);
			}
		} else {
			if (argument.type == "text") {
				cb([{
					plainText: "Text String"
				}]);
				return;
			} else {
				var matchingCommands = _.map(autocompleteCommand(argument.type, commandSexpr[commandSexpr.length-1]), function(cmd) {
					cmd.value = utils.replaceLast(q, commandSexpr[commandSexpr.length-1], cmd.name);
					return cmd;
				});
				cb(matchingCommands);
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
	displayKey: 'value',
	source: commandMatcher(),
	templates: {
		empty: '<div class="tt-suggestion">No suggestions</div>',
		suggestion: commandTemplate
	}
});