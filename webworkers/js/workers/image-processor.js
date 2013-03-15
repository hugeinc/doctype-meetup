/**
 * @author Rob LaPlaca - rlaplaca@hugeinc.com
 * @description 
 */
self.onmessage = function(e) {
	var mode = e.data.mode || "",
		imageData = e.data.imageData || "";

	switch(mode) {
		case "greyscale":
			convertImageToGreyScale( imageData );
		break;
		case "threshold":
			applyThresholdToImage( imageData );
		break;
		case "someRandomFilter":
			applySomeRandomFilter( imageData );
		break;
		default:
			handleModeError( mode );
	}
};

function convertImageToGreyScale( imageData ) {
	if( imageData !== "" ) {

		// Loop through all the pixels, average out the RGB values and reassign
		// the average to each pixel
		for( var j=0; j<1000; j++ ) {
			for( var i=0, len = imageData.data.length; i<len; i+=4 ) {
				var red = imageData.data[i],
					green = imageData.data[i+1],
					blue = imageData.data[i+2];

				var grey = (red + green + blue) / 3;

				imageData.data[i] = grey;
				imageData.data[i+1] = grey;
				imageData.data[i+2] = grey;
			}
		}

		postMessage({
			status: "success",
			imageData: imageData
		});

	} else {
		handleNoImageData();
	}
}

function applyThresholdToImage( imageData ) {
	if( imageData !== "" ) {
		// Loop through all the pixels, average out the RGB values and reassign
		// the average to each pixel
		for( var j=0; j<1000; j++ ) {
			for( var i=0, len = imageData.data.length; i<len; i+=4 ) {
				var alpha = imageData.data[i+3],
					colorAsNumber = imageData.data[i] << 16 | imageData.data[i + 1] | imageData.data[i + 2];
						
				if(colorAsNumber < 15000000) {
					imageData.data[i] = 0;	  
					imageData.data[i+1] = 0;
					imageData.data[i+2] = 0;
					imageData.data[i+3] = alpha;	  	  	
				} else {
					imageData.data[i] = 255;	  
					imageData.data[i+1] = 255;
					imageData.data[i+2] = 255;
					imageData.data[i+3] = alpha;
				} 
			}
		}

		postMessage({
			status: "success",
			imageData: imageData
		});
	} else {
		handleNoImageData();
	}
}

function applySomeRandomFilter( imageData ) {
	// another filter goes here
}

function handleModeError(mode) {
	postMessage({
		status: "error",
		msg: "Invalid mode: " + mode
	});
}

function handleNoImageData() {
	postMessage({
		status: "error",
		msg: "No image data was provided!"
	});	
}