//shim for web context
var contextClass = 
	(window.AudioContext || 
  	window.webkitAudioContext || 
  	window.mozAudioContext || 
  	window.oAudioContext || 
  	window.msAudioContext);

if (contextClass) {
  	// Web Audio API is available.
  	var context = new contextClass();
}

var nyanBuffer = null;

function loadNyan(url) {
  	var request = new XMLHttpRequest();
  	request.open('GET', url, true);
  	request.responseType = 'arraybuffer';

	// Decode asynchronously
	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
		  nyanBuffer = buffer;
		}, onError);
	}
  	request.send();
}