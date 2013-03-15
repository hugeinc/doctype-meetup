/**
 * @author Rob LaPlaca - rlaplaca@hugeinc.com
 * @description 
 */
(function() {

  var log = document.getElementById('shared-worker-output');
  var chat = document.getElementById('chat');

  if( chat != null ) {

	  var worker = new SharedWorker("/js/workers/shared-worker.js");

	  worker.port.onmessage = function(e) { // note: not worker.onmessage!
			if( e.data.type === "status" ) {
				log.textContent += '\n' + e.data.msg;
			} else if( e.data.type === "chat" ) {
				chat.innerHTML = e.data.msg;
			} else if( e.data.type === "prime" ) {
				// console.log( "prime!: ", e.data.msg );
			}
	  };

	var form = document.getElementsByTagName("form")[0],
		input = document.getElementsByTagName("input")[0];

	form.addEventListener("submit", function(e) {
		e.preventDefault();

		var msg = log.textContent + "- " + input.value;

		worker.port.postMessage( msg );
		input.value = "";
	});
  }

	// This is for the page that launches the windows
	var button = document.getElementsByTagName("button")[0];
	button.addEventListener("click", function(e) {
		e.preventDefault();
		
		window.open("/examples/shared-workers-popup.html", "window2", "height=400,width=500,left=20,top=100");
		window.open("/examples/shared-workers-popup.html", "window1", "height=400,width=500,left=540,top=100");
		
	});

})();