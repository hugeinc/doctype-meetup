(function() {

	var $window,
		soundBuffer = [],
		sources = [],
		viewPercentages = {},
		windowHeight = 0,
		$sections = [],
		areAllSoundsLoaded = false,
		context = new webkitAudioContext();

	$(function() {
		$window = $(window);
		$sections = $(".section");
		windowHeight = $window.height();
		
		var totalSections = $sections.length,
			loadedSections = 0;

		// Setup initial state, defaulting to zero
		for(var i=0; i<totalSections; i++) {
			var sectionName = $sections.eq(i).data("section");

			var viewPercentageInstance = viewPercentages[ sectionName ] = {};
			viewPercentageInstance.percentShowing = 0;
			viewPercentageInstance.height = $sections.eq(i).height();
			viewPercentageInstance.top = $sections.eq(i).position().top;

			loadSound("audio/" + sectionName + ".mp3", function() {
				loadedSections++;

				if( loadedSections === totalSections ) {
					handleAllSoundsLoaded();
				}
			});
		}

		setupScrollListener();
	});
	
	function setupScrollListener() {
		$window.scroll(function(e) {
			if( areAllSoundsLoaded === true ) {
				var scrollTop = $(e.target).scrollTop();
				setViewPercentages(scrollTop);

				var k = 0;
				for( var i in viewPercentages ) { 
					var source = sources[k];
					source.gainNode.gain.value = viewPercentages[i].percentShowing;

					k++;
				}
			}
		});
	}

	function handleAllSoundsLoaded() {
		areAllSoundsLoaded = true;

		for( var i=0; i<soundBuffer.length; i++ ) {
			var sound = createSource(soundBuffer[i]);
			sound.gainNode.gain.value = 0;
	    	sound.source.noteOn(0);	
	    	sources.push(sound);
		}

		$window.trigger("scroll");
	}

	function setViewPercentages( windowTop ) {
		var windowUpperLimit = windowTop,
			windowLowerLimit = windowTop + windowHeight;

		for(var i=0; i<$sections.length; i++) {
			var $section = $sections.eq(i),
				sectionName = $sections.eq(i).data("section");

			viewPercentages[sectionName].percentShowing = 0;
			
			var sectionData = viewPercentages[sectionName],
				sectionUpperLimit = sectionData.top,
				sectionLowerLimit = sectionUpperLimit + sectionData.height;

			if( (sectionUpperLimit >= windowUpperLimit && sectionUpperLimit <= windowLowerLimit) ) {
				sectionData.percentShowing = 1;
			} else if( (sectionLowerLimit >= windowUpperLimit && sectionLowerLimit <= windowLowerLimit) ) {
				sectionData.percentShowing = 1;
			} else {
				sectionData.percentShowing = 0;
			}

		}
	}

	function loadSound(url, cbf) {
	  var request = new XMLHttpRequest();
	  request.open('GET', url, true);
	  request.responseType = 'arraybuffer';

	  // Decode asynchronously
	  request.onload = function() {
	    context.decodeAudioData(request.response, function(buffer) {
	      soundBuffer.push(buffer);
	      cbf();
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


})();