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

var isPlaying = false;
var scheduleAheadTime = 1; //var scheduleAheadTime = 0.1;
var lookahead = 25.0;
var timerID = 0;

var bufferList = new Array();
var triggerArray = new Array();

function init(){
    bindWindowActions();
    setUpTriggerArrays();
    bufferLoad();
}

function setUpTriggerArrays() {
    //TODO: use jquery to set limit of layers onload

    for (var i = 0; i < 4; i++){
        triggerArray[i] = new Array();
    }
}

function bindWindowActions(){
    
    $(document).on('keydown', function(e){
        bindPlay(e);
    });

}

function bindPlay(e){
    
    if (e.which === 32) {
        isPlaying = !isPlaying;
        play(bufferList);
    }
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
    if (isPlaying) {
        scheduler(bufferList);
    } else {
        clearTimeout(timerID)
    }
}

var thisTriggerArray = new Array();

function scheduler(bufferList, lookahead) {
    
    //playSound(bufferList[1], .5);
                 //console.log(bufferList);
    for (var i = 0; i < triggerArray.length; i++) {

        thisTriggerArray = triggerArray[i];

        for (var j = 0; j < thisTriggerArray.length; j++) {
            //console.log(triggerArray[j]);

            // IMPORTANT.. context currentTime needs to be reset, or else it will think all array members are less than schedule ahead time (in the past)

            if (context.currentTime + thisTriggerArray[j] < context.currentTime + scheduleAheadTime){
                
                playSound(bufferList[i], thisTriggerArray[j]);

                console.log(bufferList[i] + ',' + thisTriggerArray[j]);
            }
        }

    }
    /***
    ** SUPER IMPORTANT
    ** lookahead is waaaaaay shorter than scheduleahead time, so this will always check way more frequently than the notes scheduled could possibly be triggered
    ** NOTE: soooo, if you schedule the same sound twice, will it fire twice?
    */
    //timerID = window.setTimeout( function(){scheduler(bufferList, lookahead)}, lookahead );
}

function playSound(sample, time) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    //console.log(sample);
    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);

    // IMPORTANT.. context currentTime needs to be reset, or else it will think the current time is in the past, and will always fire immediately
    source.start(context.currentTime + time);
}

init();

