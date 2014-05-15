var main = require("./main.js");
var ch = require("./commandhandler.js");
var utils = require("./utils.js");

var $ = window.$; // jQuery is in "window" here
var _ = require("lodash");

var isShowingPopup = false;

$("#popup").hide();
$(window.document).keyup(function(evt) {
	if (evt.which == 27) { // Escape
		if (!isShowingPopup) {
			$("#popup").show();
			$("#popup-input").focus();
			$("#popup-input").val("");
			isShowingPopup = true;
			evt.stopPropagation();
		} else {
			$("#popup").hide();
			main.editor.focus();
			isShowingPopup = false;
		}
	} else if (evt.which == 13) {
		if (isShowingPopup) {
			ch.execute(ch.splitQuery($("#popup-input").val()));
			$("#popup").hide();
			main.editor.focus();
			isShowingPopup = false;
		}
	}
});