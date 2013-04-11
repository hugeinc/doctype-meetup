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
var scheduleAheadTime = .1; //var scheduleAheadTime = 0.1; in secs
var lookahead = 25; // var lookahead = 25; in ms
var timerID = 0;
var nextNoteTime = 0;
var nextNoteTime1 = 0;
var nextNoteCount = 0;
var nextNoteCount1 = 0;

var bufferList = new Array();
var triggerArray = new Array();

function init(){
    bindWindowActions();
    setUpTriggerArrays();
    bufferLoad();
    //play();
    console.log(nextNoteTime);
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
    //play(buffers);
    bufferList = buffers;
}

var singleBeat = false;

function nextNote1(array, index) {

    //NOTE: if next note time is 0 it won't fire, but .1 is fine

    // FOR PRES: set when it's 0, next note = 0

    // if (array[nextNoteCount1] === 0){
    //     nextNoteTime1 = context.currentTime;
    //     //alert('0');
    // } else {
    //     nextNoteTime1 += array[nextNoteCount1];
    // }

    nextNoteTime1 += array[nextNoteCount1];

    //console.log('nextNoteTime1' + nextNoteTime1);

    //console.log('count:' + nextNoteCount + 'value:' + array[nextNoteCount]);

    nextNoteCount1++;

    nextNoteCount1 = nextNoteCount1 % array.length;

    // if (nextNoteCount == array.length){
    //     newBeat1 = false;
    // }

    current16thNote++;  // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( time, bufferSound ) {
    playSound( time, bufferSound);
}

/***
**  Maybe I need a schedular per layer... man I suck
*/


function nextNote(array, index) {

    //NOTE: if next note time is 0 it won't fire, but .1 is fine

    // FOR PRES: set when it's 0, next note = 0

    // if (array[nextNoteCount] === 0){
    //     nextNoteTime = context.currentTime;
    //     //alert('0');
    // } else {
    //     nextNoteTime += array[nextNoteCount];
    // }


    ////**** IMPORTANT! 
        //    have to subtract the diff from the beats


    nextNoteTime += array[nextNoteCount];
    console.log('nextNoteCount: ' + nextNoteCount + 'array[nextNoteCount]: ' + array[nextNoteCount] + 'nextNoteTime: ' + nextNoteTime + 'array length: ' + array.length);

    //console.log('count:' + nextNoteCount + 'value:' + array[nextNoteCount]);
    if (array.length > 1){
        nextNoteCount++;

        if (nextNoteCount === 3 || singleBeat){
            newBeat = true;
            console.log('I should stop!');
        }

        nextNoteCount = nextNoteCount % array.length;
    } else {
        nextNoteCount = 0;
        singleBeat = true;
    }

    //console.log(nextNoteCount + 'array length:' + array.length);

    //console.log('the beat number:' + Math.floor(context.currentTime / oneBeat));

    

    
      // Advance the beat number, wrap to zero
    
}

var index = 0;
var index1 = 0;

var oneBeat = 60 / 60;

var theBeat = 0;
var oldBeat = 0;
var contextBeat = 0;
var newBeat1 = true;

function checkBeat(){
    contextBeat = Math.floor(context.currentTime / oneBeat);
    
    if (theBeat < contextBeat) {
        
        theBeat++;
        newBeat = true;
        newBeat1 = true;
        console.log(theBeat + '/' + contextBeat);
    }
    
    //console.log('new beat' + theBeat + 'context beat:' + Math.floor(context.currentTime / oneBeat));
}

function scheduler(triggerArray, bufferSound) {
    
    index = index % triggerArray[0].length;
    index1 = index1 % triggerArray[1].length;

    checkBeat();
    //console.log(newBeat);
    while (nextNoteTime < context.currentTime + scheduleAheadTime) {
            //console.log(nextNoteTime);

            //console.log('next note time:' + triggerArray[i][index]);
            
            scheduleNote( nextNoteTime, bufferList[0] );
            nextNote(triggerArray[0], index);

            index++;

        }

    // while (nextNoteTime1 < context.currentTime + scheduleAheadTime && newBeat1) {
            
    //         //console.log(triggerArray[1].length);

    //         //console.log(nextNoteTime1);

    //         //console.log('next note time:' + triggerArray[i][index]);


    //         scheduleNote( nextNoteTime1, bufferList[2] );
    //         nextNote1(triggerArray[1], index1);

    //         index1++;

    //     }

    
    timerID = window.setTimeout( function() {scheduler(triggerArray)}, lookahead );
    
    
}

function play() {
    isPlaying = !isPlaying;

    if (isPlaying) { // start playing
        current16thNote = 0;
        nextNoteTime = context.currentTime;
        nextNoteTime1 = context.currentTime;
        scheduler(triggerArray);
        return "stop";
    } else {
        window.clearTimeout( timerID );
        return "play";
    }
}

function playSound( time, sample) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    //console.log(sample + ',' + time);
    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);
    source.start(time);
}

init();

