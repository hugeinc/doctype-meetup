(function() {

	var $window,
		soundBuffer = [],
		sources = [],
		viewPercentages = {},
		windowHeight = 0,
		$sections = [],
		context = new webkitAudioContext();

	$(function() {
		$window = $(window);
		$sections = $(".section");
		windowHeight = $window.height();
		
		// Setup initial state, defaulting to zero
		for(var i=0; i<$sections.length; i++) {
			var sectionName = $sections.eq(i).data("section");

			var viewPercentageInstance = viewPercentages[ sectionName ] = {};
			viewPercentageInstance.percentShowing = 0;
			viewPercentageInstance.height = $sections.eq(i).height();
			viewPercentageInstance.top = $sections.eq(i).position().top;

			loadSound("/bird-watching/audio/" + sectionName + ".mp3");
		}

		$window.scroll(function(e) {
			var scrollTop = $(e.target).scrollTop();
			// console.log(scrollTop, ": ", windowHeight)
			setViewPercentages(scrollTop);

			var k = 0;
			for( var i in viewPercentages ) { 
				// var sources = viewPercentages[i];
				var source = sources[k];
				source.gainNode.gain.value = viewPercentages[i].percentShowing;

				k++;
			}
		});

		setTimeout(function() {
			for( var i=0; i<soundBuffer.length; i++ ) {
				var sound = createSource(soundBuffer[i]);
				sound.gainNode.gain.value = 0;
		    	sound.source.noteOn(0);	
		    	sources.push(sound);
			}

			var element = sources[0];
			
			// var x = parseInt(element.value) / parseInt(element.max);

			// // Use an equal-power crossfading curve:
			// var gain1 = Math.cos(x * 0.5*Math.PI);
			// var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
			// element.gainNode.gain.value = gain2;
			// element.gainNode.gain.value = 1;
			// sources[1].gainNode.gain.value = .05;
			// this.ctl2.gainNode.gain.value = gain2;
		}, 3000);

	});

	function setViewPercentages( windowTop ) {
		var windowUpperLimit = windowTop,
			windowLowerLimit = windowTop + windowHeight;

		// console.log("windowUpperLimit: ", windowUpperLimit);
		// console.log("windowLowerLimit: ", windowLowerLimit);
		// console.log("========");
		// console.clear();

		for(var i=0; i<$sections.length; i++) {
			var $section = $sections.eq(i),
				sectionName = $sections.eq(i).data("section");

			viewPercentages[sectionName].percentShowing = 0;
			
			var sectionData = viewPercentages[sectionName],
				sectionUpperLimit = sectionData.top,
				sectionLowerLimit = sectionUpperLimit + sectionData.height;

			// console.log("sectionUpperLimit: ", sectionUpperLimit);
			// console.log("sectionLowerLimit: ", sectionLowerLimit);
			// console.log("----------");

			if( (sectionUpperLimit >= windowUpperLimit && sectionUpperLimit <= windowLowerLimit) ) {
				sectionData.percentShowing = 1;
			} else if( (sectionLowerLimit >= windowUpperLimit && sectionLowerLimit <= windowLowerLimit) ) {
				sectionData.percentShowing = 1;
			} else {
				sectionData.percentShowing = 0;
			}

		}
	}

	function loadSound(url) {
	  var request = new XMLHttpRequest();
	  request.open('GET', url, true);
	  request.responseType = 'arraybuffer';

	  // Decode asynchronously
	  request.onload = function() {
	    context.decodeAudioData(request.response, function(buffer) {
	      soundBuffer.push(buffer);
	    }, function() {});
	  }
	  request.send();
	}

	function createSource(buffer) {
		var source = context.createBufferSource();
		
		// Create a gain node.
		var gainNode = context.createGainNode();
		source.buffer = buffer;
		
		// Turn on looping.
		source.loop = true;
		
		// Connect source to gain.
		source.connect(gainNode);
		
		// Connect gain to destination.
		gainNode.connect(context.destination);

		return {
			source: source,
			gainNode: gainNode
		};
	}

	return;

	var CrossfadeSample = {};

	CrossfadeSample.play = function() {
	  // Create two sources.
	  this.ctl1 = createSource(BUFFERS.drums);
	  this.ctl2 = createSource(BUFFERS.organ);
	  // Mute the second source.
	  this.ctl1.gainNode.gain.value = 0;
	  // Start playback in a loop
	  this.ctl1.source.noteOn(0);
	  this.ctl2.source.noteOn(0);
	  // Set the initial crossfade to be just source 1.
	  this.crossfade(0);

	  function createSource(buffer) {
	    var source = context.createBufferSource();
	    var gainNode = context.createGainNode();
	    source.buffer = buffer;
	    // Turn on looping
	    source.loop = true;
	    // Connect source to gain.
	    source.connect(gainNode);
	    // Connect gain to destination.
	    gainNode.connect(context.destination);

	    return {
	      source: source,
	      gainNode: gainNode
	    };
	  }
	};

	CrossfadeSample.stop = function() {
	  this.ctl1.source.noteOff(0);
	  this.ctl2.source.noteOff(0);
	};

	// Fades between 0 (all source 1) and 1 (all source 2)
	CrossfadeSample.crossfade = function(element) {
	  var x = parseInt(element.value) / parseInt(element.max);
	  // Use an equal-power crossfading curve:
	  var gain1 = Math.cos(x * 0.5*Math.PI);
	  var gain2 = Math.cos((1.0 - x) * 0.5*Math.PI);
	  this.ctl1.gainNode.gain.value = gain1;
	  this.ctl2.gainNode.gain.value = gain2;
	};

	CrossfadeSample.toggle = function() {
	  this.playing ? this.stop() : this.play();
	  this.playing = !this.playing;
	};

	

})();