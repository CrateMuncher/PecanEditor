var path = require("path");
var fs = require("fs");
var _ = require("lodash");
var utils = require("./utils.js");

module.exports = {
	defaults: {
		fuzzyFinderIgnore: [
			"**/node_modules/**"
		]
	},
	options: {},
	loadOptionsTree: function(absdir) {
		var split = absdir.split(path.sep);

		fs.appendFileSync(this.getUserConfig(), "");
		var configString = fs.readFileSync(this.getUserConfig(), { encoding: 'utf8' });
		try {
			var configData = JSON.parse(configString);
		} catch (e) {
			var configData = {};
		}

		var userConfigWithDefaults = _.assign(this.defaults, configData);
		fs.writeFileSync(this.getUserConfig(), JSON.stringify(userConfigWithDefaults));

		var configs = [];
		while (split.length > 0) {
			var thisPath = split.join(path.sep);
			var files = fs.readdirSync(thisPath + path.sep);
			var config = _.some(files, function(file) {
			    return file === ".pecan.json";
			});
			if (config) {
			    var configString = fs.readFileSync(path.normalize(thisPath + path.sep + ".pecan.json"), { encoding: 'utf8' });
			    var configData = JSON.parse(configString);
			    configs.push(configData);
			}
			split.pop();
		}
		configs.push(userConfigWithDefaults);
		configs.push(this.defaults);
		configs = configs.reverse();
		
		this.options = _.assign.apply(null, configs);
	},
	getUserConfig: function() {
		return utils.getUserHome() + path.sep + ".pecan.json";
	}
};