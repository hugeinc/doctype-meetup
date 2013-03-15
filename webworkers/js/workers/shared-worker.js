var count = 0;
var chat = [];
var latestChat = "";

onconnect = function(e) {
  	count += 1;
  	var port = e.ports[0];
  
  	port.postMessage({
  		type: "status",
  		msg: 'user #' + count + "\n"
  	});
  
	port.onmessage = function(e) {
		chat.unshift( e.data );
	}

	setInterval(function() {
		latestChat = chat.join("<br />")

  		port.postMessage({
  			type: "chat", 
  			msg: latestChat
  		});	
	}, 300);
};

