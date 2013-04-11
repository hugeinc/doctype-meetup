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

function nextNote(array, index) {

    //NOTE: if next note time is 0 it won't fire, but .1 is fine

    // FOR PRES: set when it's 0, next note = 0

    // if (array[nextNoteCount] === 0){
    //     nextNoteTime = context.currentTime;
    //     //alert('0');
    // } else {
    //     nextNoteTime += array[nextNoteCount];
    // }

    nextNoteTime += array[nextNoteCount];

    //console.log('count:' + nextNoteCount + 'value:' + array[nextNoteCount]);

    nextNoteCount++;

    nextNoteCount = nextNoteCount % array.length;

    current16thNote++;  // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function nextNote1(array, index) {

    //NOTE: if next note time is 0 it won't fire, but .1 is fine

    // FOR PRES: set when it's 0, next note = 0

    if (array[nextNoteCount1] === 0){
        nextNoteTime1 = context.currentTime;
        //alert('0');
    } else {
        nextNoteTime1 += array[nextNoteCount1];
    }

    console.log('nextNoteTime1' + nextNoteTime1);

    //console.log('count:' + nextNoteCount + 'value:' + array[nextNoteCount]);

    nextNoteCount1++;

    nextNoteCount1 = nextNoteCount1 % array.length;

    current16thNote++;  // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

function scheduleNote( time, bufferSound ) {
    // push the note on the queue, even if we're not playing.
  //   notesInQueue.push( { note: beatNumber, time: time } );

  // if ( (noteResolution==1) && (beatNumber%2))
  //   return; // we're not playing non-8th 16th notes
  // if ( (noteResolution==2) && (beatNumber%4))
  //   return; // we're not playing non-quarter 8th notes

  // create an oscillator
  // var osc = context.createOscillator();
  // osc.connect( context.destination );
  // if (! (beatNumber % 16) ) // beat 0 == low pitch
  //   osc.frequency.value = 220.0;
  // else if (beatNumber % 4)  // quarter notes = medium pitch
  //   osc.frequency.value = 440.0;
  // else            // other 16th notes = high pitch
  //   osc.frequency.value = 880.0;

  //   // TODO: Once start()/stop() deploys on Safari and iOS, these should be changed.
  // osc.noteOn( time );
  // osc.noteOff( time + noteLength );

  //playSound( time, bufferList[bufferSound]);
  console.log(time);
  playSound( time, bufferSound);
}

/***
**  Maybe I need a schedular per layer... man I suck
*/

var index = 0;
var index1 = 0;

function scheduler(triggerArray, bufferSound) {
    //console.log(nextNoteTime + 'I suck' + (context.currentTime + scheduleAheadTime))
    

    // while there are notes that will need to play before the next interval, 
    // schedule them and advance the pointer.
    
    //alert(triggerArray.length);
    
    // for (var i = 1; i < 3; i++) {

    //     //console.log('trigger array:' + triggerArray[i]);
    //     //console.log('buffer sound:' + bufferList[i]);

    //     index = index % triggerArray[i].length;

    //     console.log(i);

    //     while (nextNoteTime < context.currentTime + scheduleAheadTime ) {
            
    //         console.log(triggerArray[i].length);

    //         //console.log('next note time:' + triggerArray[i][index]);
    //         scheduleNote( nextNoteTime, bufferList[i] );
    //         nextNote(triggerArray[i], index);

    //         index++;

    //     }
        
    // }

    index = index % triggerArray[0].length;
    index1 = index1 % triggerArray[1].length;

    while (nextNoteTime < context.currentTime + scheduleAheadTime ) {
            
            console.log(nextNoteTime);

            //console.log('next note time:' + triggerArray[i][index]);
            scheduleNote( nextNoteTime, bufferList[0] );
            nextNote(triggerArray[0], index);

            index++;

        }

    while (nextNoteTime1 < context.currentTime + scheduleAheadTime ) {
            
            console.log(triggerArray[1].length);

            console.log(nextNoteTime1);

            //console.log('next note time:' + triggerArray[i][index]);


            scheduleNote( nextNoteTime1, bufferList[2] );
            nextNote1(triggerArray[1], index1);

            index1++;

        }


    timerID = window.setTimeout( function() {scheduler(triggerArray)}, lookahead );
}

function play() {
  isPlaying = !isPlaying;

  if (isPlaying) { // start playing
    current16thNote = 0;
    nextNoteTime = context.currentTime;
    nextNoteTime1 = context.currentTime;
    //scheduler(triggerArray[0], 0);

    scheduler(triggerArray);
    //schedulerSetup();  // kick off scheduling
    return "stop";
  } else {
    window.clearTimeout( timerID );
    return "play";
  }
}


// function play(bufferList){
//     isPlaying = !isPlaying;
//     if (isPlaying) {
//         scheduler(bufferList);
//         //nextNoteTime = context.currentTime;
//     } else {
//         clearTimeout(timerID);
//         //nextNoteTime = 0;
//     }
// }

// var thisTriggerArray = new Array();

// function scheduler(bufferList) {
//     //console.log(lookahead);
//     //playSound(bufferList[1], .5);
//                  //console.log(bufferList);


//     // IMPORTANT current time will not update until you fire audio or a sound
//     //playSound(bufferList[0], 1);
//     console.log('current time?:' + context.currentTime + scheduleAheadTime + 'stuff' + triggerArray[0][1]);           
    
//     while (nextNoteTime < context.currentTime + scheduleAheadTime){
//         playSound(bufferList[0], nextNoteTime);
        
//         nextNote(triggerArray[0], 0);
//         console.log('next note time:' + nextNoteTime);

//         console.log('trigger time:' + triggerArray[0][1]);
//     }





function schedulerSetup() {
    scheduler(triggerArray[0], 0);
    
    //scheduler(triggerArray[2], 1);

    for (var i = 0; i < triggerArray.length; i++) {

        thisTriggerArray = triggerArray[i];

        for (var j = 0; j < thisTriggerArray.length; j++) {
            
              

            //console.log(triggerArray[j]);
            //console.log(i);
            // IMPORTANT.. context currentTime needs to be reset, or else it will think all array members are less than schedule ahead time (in the past);

            //if (nextNoteTime < context.currentTime + scheduleAheadTime){
            //console.log(thisTriggerArray[j]);
            //if (context.currentTime + thisTriggerArray[j] < context.currentTime + scheduleAheadTime){
            //if (nextNoteTime < context.currentTime + scheduleAheadTime){
                //console.log('nextNote!:' + nextNoteTime);
                //playSound(bufferList[i], thisTriggerArray[j]);
                //nextNote(thisTriggerArray, j);
            //}

        }

    }
    /***
    ** SUPER IMPORTANT
    ** lookahead is waaaaaay shorter than scheduleahead time, so this will always check way more frequently than the notes scheduled could possibly be triggered
    ** NOTE: soooo, if you schedule the same sound twice, will it fire twice?
    */
    //timerID = window.setTimeout( function(){scheduler(bufferList, lookahead)}, 25 );
}

// function nextNote(array, index) {
//     //console.log('index' + parseInt(index) + 1);

//     //nextNoteTime = array[index + 1] + context.currentTime;
    
//     nextNoteTime += .25;

//     //console.log(array[index + 1]);
//     //nextNoteTime += .55;
//     //console.log(nextNoteTime + '...' + (context.currentTime + scheduleAheadTime));
//     //alert(array[index]);
// }

function playSound( time, sample) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    //console.log(sample + ',' + time);
    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);

    // IMPORTANT.. context currentTime needs to be reset, or else it will think the current time is in the past, and will always fire immediately
    // Apparently I am super fucking wrong
    // source.start(context.currentTime + time);

    source.start(time);
}

init();

