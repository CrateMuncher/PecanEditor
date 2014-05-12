var main = require("./main.js");

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
		} else {
			$("#popup").hide();
			main.editor.focus();
			isShowingPopup = false;
		}
	} else if (evt.which == 13) {
		if (isShowingPopup) {
			main.handleCommand($("#popup-input").val());
			$("#popup").hide();
			main.editor.focus();
			isShowingPopup = false;
		}
	}
});