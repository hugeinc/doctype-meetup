var Sequencer = angular.module('sequencer', []);

/***
** This should be one way end of line play, I should be able to wrap this in a name space
*/

var sampleArray = 
    [
        '../assets/FH2_Kick_26.wav',
        '../assets/FH2_Crash_02.wav',
        '../assets/FH2_Hat_09.wav',
        '../assets/FH2_Snare_05.wav'
    ]

var bufferList = new Array();
//var scheduleAheadTime = 0.1;

var scheduleAheadTime = 1;

var triggerArray = new Array();

function setUpTriggerArrays() {
    //TODO: use jquery to set limit of layers onload

    for (var i = 0; i < 4; i++){
        triggerArray[i] = new Array();
    }
}

function init(){
    setUpTriggerArrays();
    bufferLoad();
}

function bufferLoad() {
  
  	var bufferLoader = new BufferLoader(
    	 context,
	     sampleArray,
	     loadCallback
    );

  	bufferLoader.load();
}

function loadCallback(buffers){
    play(buffers);
    bufferList = buffers;
}

function play(bufferList){
    scheduler(bufferList);
}

function playSound(sample, time) {
    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);
    source.start(time);
}

function scheduler(bufferList) {
    
    var thisTriggerArray = new Array();

    for (var i = 0; i < triggerArray.length; i++) {

        thisTriggerArray = triggerArray[i];

        for (var j = 0; j < thisTriggerArray.length; j++) {
          
            if (triggerArray[j] < context.currentTime + scheduleAheadTime){
                
                playSound(bufferList[i], thisTriggerArray[j]);
            }
        }

    }
    /***
    ** SUPER IMPORTANT
    ** lookahead is waaaaaay shorter than scheduleahead time, so this will always check way more frequently than the notes scheduled could possibly be triggered
    ** NOTE: soooo, if you schedule the same sound twice, will it fire twice?
    */
    //timerID = window.setTimeout( scheduler, lookahead );
}

init();

