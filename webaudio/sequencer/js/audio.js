var Sequencer = angular.module('sequencer', []);

var sampleArray = 
    [
        'assets/FH2_Kick_26.wav',
        'assets/FH2_Hat_09.wav',
        'assets/FH2_Crash_02.wav',
        'assets/FH2_Snare_05.wav'
    ]

var isPlaying = false;
var scheduleAheadTime = .1; //var scheduleAheadTime = 0.1; in secs
var lookahead = 25; // var lookahead = 25; in ms
var timerID = 0;

var nextNoteTime = 0;
var nextNoteCount = 0;
var singleBeat = false;
var isNextNote = true;


var index = 0;

var oneBeat = 60 / 60;
var theBeat = 0;
var contextBeat = 0;
var newBeat = true;

var bufferList = new Array();
var triggerArray = new Array();

function init(){
    bindWindowActions();
    bufferLoad();
    //play();
}

function bindWindowActions(){
    $(document).on('keydown', function(e){
        bindPlay(e);
    });
}

function bindPlay(e){
    if (e.which === 32) {
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
    bufferList = buffers;
}

function scheduleNote( time, bufferSound ) {
    playSound( time, bufferSound);
}

function nextNote(array, index) {

    nextNoteTime += triggerArray[index].nextNoteTime;
    
    if (triggerArray.length > 1){
        
        if (nextNoteCount === triggerArray.length || singleBeat){
            newBeat = false;

            isNextNote = false;
            console.log('I should stop!');
            nextNoteCount = 0;

        } else {
            nextNoteCount = nextNoteCount % triggerArray.length;
        }

    } else {
        nextNoteCount = 0;
        singleBeat = true;
    }

    nextNoteCount++;
}

/*
    TODO: this and play should go in transport.js.
*/
function checkBeat(){
    //oneBeat = 60 / 60; // in sequencer now
//    alert(tempo);
    contextBeat = Math.floor(context.currentTime / oneBeat);

    if (theBeat < contextBeat) {
        
        nextNoteTime = context.currentTime;
        theBeat++;

        isNextNote = true;
        console.log('played');

    }
    
    //console.log('new beat' + theBeat + 'context beat:' + Math.floor(context.currentTime / oneBeat));
}

function play() {
    isPlaying = !isPlaying;
    
    if (isPlaying) { // start playing
        console.log('played');
        console.log('triggerArray: ');
        console.log(triggerArray);

        //kick it off
        scheduler(triggerArray);
        
    } else {
        window.clearTimeout( timerID );
        console.log('stop');
    }
}

function scheduler(triggerArray, bufferSound) {
    
    checkBeat();
    
    while (nextNoteTime < context.currentTime + scheduleAheadTime && isNextNote === true) {
        
        index = index % triggerArray.length;
        scheduleNote( nextNoteTime, bufferList[triggerArray[index].layer] );
        nextNote(triggerArray[index].nextNoteTime, index);
    
        index++;   

    }
    
    theBeat = Math.floor(context.currentTime / oneBeat); 

    timerID = window.setTimeout( function() {
        scheduler(triggerArray); 
    } , lookahead );

}


function playSound( time, sample) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);
    source.start(time);

    console.log('index:' + index);
}

init();

