;(function() {
	
	var VisualRouter = function(params) {

		var opts = $.extend({}, params),
			context = null,
			canvasIndex = 0;
		
		var microphoneNode = null,
			allSourceEndpoints = [], 
			allTargetEndpoints = [],
			sourceNodes = [];

		var $stage = null,
			audioContext = null,
			sources = {},
			visualNodes = [];

		// Node tree styles
		var connectorPaintStyle = {
			lineWidth: 3,
			strokeStyle: "#5bb75b",
			gradient: { stops:[ [ 0, "#08c" ], [ 1, "#5bb75b" ] ] },
			joinstyle: "round",
			outlineWidth: 7 
		},
		connectorHoverStyle = {
			gradient: { stops:[ [ 0, "#da4f49" ], [ 1, "#da4f49" ] ] }
		},
		sourceEndpoint = {
			endpoint: "Dot",
			paintStyle: { 
				fillStyle: "#08c",
				radius: 7 
			},
			isSource: true,
			connector: ["Bezier", { curviness:63 } ],
			connectorStyle: connectorPaintStyle,
			hoverPaintStyle: connectorHoverStyle,
			connectorHoverStyle: connectorHoverStyle,
	        dragOptions: {}
		},
		targetEndpoint = {
			endpoint: "Dot",					
			paintStyle: { fillStyle:"#5bb75b",radius:7 },
			hoverPaintStyle: connectorHoverStyle,
			maxConnections: -1,
			dropOptions: { hoverClass:"hover", activeClass:"active" },
			isTarget: true
		};

		function init() {
			if( isAudioApiSupported() ) {
				$stage = $(".stage");						

				bindNodeDetachment();
				setupAddNodeMenu();
				setupPlayButton();	
			}
		}

		/**
		 * If Audio API is supported, then set the context. returns boolean
		 */	
		function isAudioApiSupported() {
			try {
				context = new webkitAudioContext();
				return true;
			} catch(e) {
				return false;
			}
		}

		/**
		 * When you click on the line connecting nodes, it will detach the nodes
		 */
		function bindNodeDetachment() {
			jsPlumb.bind("click", function(conn, originalEvent) {
				jsPlumb.detach(conn); 
			});	
		}

		/**
		 * Loads a sound, and sticks it in an array where the node id is used
		 * to define it's index
		 */
		function loadSound(url, id) {	
			var request = new XMLHttpRequest();
			request.open('GET', url, true);
			request.responseType = 'arraybuffer';

			request.onload = function() {
				context.decodeAudioData(request.response, function(buffer) {
					sources[id] = {
						buffer: buffer
					};
				}, onSoundLoadError);
			}

			request.send();
		}

		/**
		 * If there is a problem loading a sound, handle it here
		 */
		function onSoundLoadError() { }

		/**
		 * Binds the play button
		 */
		function setupPlayButton() {
			$(".btn-play").click(function(e) {
				e.preventDefault();
				
				var connections = jsPlumb.getAllConnections().jsPlumb_DefaultScope,
					nodes = {};

				for( var k=0; k<visualNodes.length; k++ ) {
					visualNodes[k].disable();
				}

				// Reset the visual nodes array				
				visualNodes = [];

				for( var i=0; i<connections.length; i++) {
					var sourceId = connections[i].sourceId,
						targetId = connections[i].targetId,
						nodeSourceType = connections[i].source.data("type"),
						nodeTargetType = connections[i].target.data("type");

					if( typeof nodes[sourceId] === "undefined" ) {
						if( nodeSourceType === "source" ) {	
							console.log("create a source node");

							nodes[sourceId] = context.createBufferSource();	
							nodes[sourceId].buffer = sources[sourceId].buffer;
							
							// Save source nodes so we can noteOn(0) them later
							sourceNodes.push( nodes[sourceId] );
						} else if( nodeSourceType === "gain" ) {
							console.log("create a source gain node: ", sourceId );

							nodes[sourceId] = context.createGainNode();
							nodes[sourceId].gain.value = 2;
						} else if( nodeSourceType === "lowpass" ) {
							console.log("create a source lowpass node: ", sourceId);
							nodes[sourceId] = context.createBiquadFilter();
							nodes[sourceId].type = 1; // Low-pass filter. See BiquadFilterNode docs
							nodes[sourceId].frequency.value = 440; // Set cutoff to 440 HZ
						} else if( nodeSourceType === "reverb" ) {
							nodes[sourceId] = context.createConvolver();
							nodes[sourceId].buffer = sources[sourceId].buffer;
						} else if( nodeSourceType === "wave-visualizer" ) {
							var canvasId = $(connections[i].source).find("canvas").attr("id");

							wavebox = new SpectrumBox(2048, 1000, canvasId, context);
							wavebox.setType(SpectrumBox.Types.TIME);
							wavebox.getCanvasContext().fillStyle = "#da4f49";
							visualNodes.push(wavebox);
							nodes[sourceId] = wavebox.getAudioNode();
						} else if( nodeSourceType === "frequency-visualizer" ) {
							var canvasId = $(connections[i].source).find("canvas").attr("id");

							frequencybox = new SpectrumBox(2048, 30, canvasId, context);
							frequencybox.setValidPoints(500);
							frequencybox.getCanvasContext().fillStyle = "rgb(150, 150, 150)";	
							nodes[sourceId] = frequencybox.getAudioNode();
							visualNodes.push(frequencybox);
						} else if( nodeSourceType === "microphone" ) {
							// console.log("create microphone node!");

							// navigator.webkitGetUserMedia({ audio: true }, function(stream) {
							// 	console.log("successfully granted microphone access!");
							//     var mediaStreamSource = context.createMediaStreamSource( stream );
							//     nodes[sourceId] = mediaStreamSource;
							// });
							nodes[sourceId] = microphoneNode;
						}
					}			

					if( typeof nodes[targetId] === "undefined" ) {
						if( nodeTargetType === "gain" ) {
							console.log("create a target gain node: ", targetId);

							nodes[targetId] = context.createGainNode();
							nodes[targetId].gain.value = 2.5;	
							
						} else if( nodeTargetType === "lowpass" ) {
							console.log("create a target lowpass node: ", targetId);

							nodes[targetId] = context.createBiquadFilter();
							nodes[targetId].type = 0; 
							nodes[targetId].frequency.value = 440; // Set cutoff to 440 HZ
						} else if( nodeTargetType === "reverb" ) {
							console.log("create a target lowpass node: ", targetId);

							nodes[targetId] = context.createConvolver();
							nodes[targetId].buffer = sources[sourceId].buffer;
						} else if( nodeTargetType === "wave-visualizer" ) {
							var canvasId = $(connections[i].target).find("canvas").attr("id");

							wavebox = new SpectrumBox(2048, 1000, canvasId, context);
							wavebox.setType(SpectrumBox.Types.TIME);
							wavebox.getCanvasContext().fillStyle = "#da4f49";
							visualNodes.push(wavebox);
							nodes[targetId] = wavebox.getAudioNode();
						} else if( nodeTargetType === "frequency-visualizer" ) {
							var canvasId = $(connections[i].target).find("canvas").attr("id");

							frequencybox = new SpectrumBox(2048, 30, canvasId, context);
							frequencybox.setValidPoints(500);
							frequencybox.getCanvasContext().fillStyle = "rgb(150, 150, 150)";	
							nodes[targetId] = frequencybox.getAudioNode();
							visualNodes.push(frequencybox);
						} else if( nodeTargetType === "microphone" ) {
							// console.log("create microphone node!");
							nodes[targetId] = microphoneNode;
							//navigator.webkitGetUserMedia({ audio: true }, function(stream) {
								// console.log("successfully granted microphone access!");
							 //    var mediaStreamSource = context.createMediaStreamSource( stream );
							 //    nodes[targetId] = mediaStreamSource;
							//});
						}	
					} 

					if( nodeTargetType === "destination" ) {
						console.log("connect to destination");
						nodes[sourceId].connect( context.destination );	
					} else {
						console.log("connect to other node");
						nodes[sourceId].connect( nodes[targetId] );
					}

					for( var k=0; k<visualNodes.length; k++ ) {
						visualNodes[k].enable();
					}
				}

				console.log("play!");

				for(var i=0; i<sourceNodes.length; i++) {
					sourceNodes[i].noteOn(0);
				}
			});

			$(".btn-stop").click(function(e) {
				e.preventDefault();
			
				for(var i=0; i<sourceNodes.length; i++) {
					sourceNodes[i].noteOff(0);
				}			
			});
		}

		/**
		 * Adds endpoints to route nodes, these are the hotspots that can be dragged to connect a node
		 */
		function addEndpoints(toId, sourceAnchors, targetAnchors) {
			for (var i = 0; i < sourceAnchors.length; i++) {
				var sourceUUID = toId + sourceAnchors[i];
				allSourceEndpoints.push(jsPlumb.addEndpoint(toId, sourceEndpoint, { anchor:sourceAnchors[i], uuid:sourceUUID }));						
			}
			for (var j = 0; j < targetAnchors.length; j++) {
				var targetUUID = toId + targetAnchors[j];
				allTargetEndpoints.push(jsPlumb.addEndpoint(toId, targetEndpoint, { anchor:targetAnchors[j], uuid:targetUUID }));						
			}
		}

		/**
		 * Binds the actions for the Add node menu
		 */
		function setupAddNodeMenu() {
			$(".add-node-menu a").click(function(e) {
				e.preventDefault();

				var type = $(this).data("type");

				if( type === "source" ) {
					addSourceNode("Seagull (Source)", "audio/laughing-gull.mp3");
				} else if( type === "source2" ) {
					addSourceNode("Groundhog Day (Source)", "audio/groundhogday.wav");
				} else if( type === "destination" ) {
					addNode("Speakers (Destination)", "destination", "top");
				} else if( type === "reverb" ) {
					addReverbNode("Reverb", "audio/groundhogday.wav");
				} else if( type === "gain" ) {
					addNode("Gain", "gain");
				} else if( type === "lowpass" ) {
					addNode("Lowpass Filter", "lowpass");
				} else if( type === "wave-visualizer" ) {
					addNode('<canvas id="wavebox-' + canvasIndex + '" width=300 height=200></canvas>', 'wave-visualizer');
					canvasIndex++;
				} else if( type === "frequency-visualizer" ) {
					addNode('<canvas id="wavebox-' + canvasIndex + '" width=300 height=200></canvas>', 'frequency-visualizer');
					canvasIndex++;
				} else if( type === "microphone" ) {
					navigator.webkitGetUserMedia({ audio: true }, function(stream) {
						
						addNode("Microphone", "microphone", "bottom", function($windowInstance) {
							var id = $windowInstance.attr("id"),
								mediaStreamSource = context.createMediaStreamSource( stream );

							microphoneNode = mediaStreamSource;	
						});
					});
				}

				
			});
		}

		/**
		 * Default setup for adding a new node to the router
		 */
		function addNode(displayTitle, nodeName, endpointConfig, adjustNode) {
			$stage.append('<div class="window btn ' + nodeName + '" data-type="' + nodeName + '"></div>');

			var $windowInstance = $(".window:last"),
				windowInstanceDom = $windowInstance.get(0);

			if( typeof displayTitle !== "undefined" ) {
				$windowInstance.html(displayTitle);	
			}

			if( endpointConfig === "top" ) {
				addEndpoints(windowInstanceDom, [], ["TopCenter"]);	
			} else if( endpointConfig === "bottom" ) {
				addEndpoints(windowInstanceDom, ["BottomCenter"], []);	
			} else {
				addEndpoints(windowInstanceDom, ["BottomCenter"], ["TopCenter"]);
			}
			
			jsPlumb.draggable($windowInstance);

			if( typeof adjustNode !== "undefined" ) {
				adjustNode($windowInstance);	
			}
		}

		/**
		 * Overrides settings form default add node to accommodate source nodes
		 */
		function addSourceNode(displayTitle, audioPath) {
			addNode(displayTitle, "source", "bottom", function($windowInstance) {
				var audioUrl = audioPath,
					id = $windowInstance.attr("id");

				loadSound(audioUrl, id);
			});
		}

		/**
		 * Configuration to add a reverb
		 */
		function addReverbNode(displayTitle, audioPath) {
			addNode(displayTitle, "reverb", null, function($windowInstance) {
				var audioUrl = audioPath,
					id = $windowInstance.attr("id");

				loadSound(audioPath, id);
			});
		}

		init();
	};

	$(function() {
		var router = new VisualRouter();
	});

})();