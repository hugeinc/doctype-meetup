/**
 * @author Rob LaPlaca - rlaplaca@hugeinc.com
 * @description
 */
(function() {

	var canvas = document.getElementsByTagName("canvas")[0],
		ctx = canvas.getContext("2d"),
		form = document.getElementsByTagName("form")[0],
		select = document.getElementsByTagName("select")[0];

	var imageHeight = 504, 
		imageWidth = 335;

	var img = new Image();
		img.src = "/img/examples/greyscale.jpg";

		img.onload = function() {

			ctx.drawImage(img, 0, 0);

			form.addEventListener("submit", function(e) {
				e.preventDefault();	

				// This worker will handle all the computation
				var imageProcessor = new Worker("/js/workers/image-processor.js");
				
				document.body.className = "working";
				
				var filterType = select.value;
				imageProcessor.postMessage({
					mode: filterType,
					imageData: ctx.getImageData(0, 0, imageWidth, imageHeight)
				});		
				
				// We setup a callback which process the response
				imageProcessor.onmessage = function(e) {
					if( e.data.status === "success" ) {
						ctx.putImageData(e.data.imageData, 0, 0);
					} else if( e.data.status === "error" ) {
						alert(e.data.msg);
					}
					document.body.className = "";
				};
				
			});
		};
})();