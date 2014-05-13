module.exports.loadAceModule = function(module) {
	var moduleSplit = module.split("/", 2);
	var path = 'lib/ace/' + moduleSplit[1] + '-' + moduleSplit[2] + '.js';
	if (window.$('script[src="' + path + '"]').length === 0) {
		// If no such script, then add one
		window.$("script").last().after('<script type="text/javascript" charset="utf-8" src="' + path + '"></script>')
	}
	return window.ace.require(module);
}