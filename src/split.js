var main = require("./main.js");
var utils = require("./utils.js");
var Split = utils.loadAceModule("ace/ext/split").Split;
var split = new Split(window.document.getElementById("editor"));

module.exports = {
	split: split
}

main.editor = split.getEditor(0);
split.on("focus", function(editor) {
    main.editor = editor;
});