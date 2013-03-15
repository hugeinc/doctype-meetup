/**
 * @author Rob LaPlaca - rlaplaca@hugeinc.com
 * @description A simple Web Worker Hello World, takes user input
 * 				in the form of a string, and then reverses the value
 * 				and places in an output field.
 */
(function() {

	// This worker will handle all the computation
	var stringReverser = new Worker("/js/workers/string-reverser.js"),
		form = document.getElementById("hello-world-form"),
		output = document.getElementById("hello-world-output");

	form.addEventListener("submit", function(e) {
		e.preventDefault();

		output.innerHTML = "loading...";
		
		var stringToReverse = document.getElementById("user-input").value;
		
		// Let's ask it to do something for us
		stringReverser.postMessage( stringToReverse );
	});

	// We setup a callback which process the response
	stringReverser.onmessage = function(e) {
		output.innerHTML = e.data;
	};

})();