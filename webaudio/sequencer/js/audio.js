var Sequencer = angular.module('sequencer', []);

/***
** This should be one way end of line play, I should be able to wrap this in a name space
*/

var sampleArray = 
    [
        '../assets/FH2_Kick_26.wav',
        '../assets/FH2_Hat_09.wav',
        '../assets/FH2_Crash_02.wav',
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

    // for (var i = 0; i < 4; i++){
    //     triggerArray[i] = new Array();
    // }
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

function scheduleNote( time, bufferSound ) {
    playSound( time, bufferSound);
}

var stop = false;

var isNextNote = true;


function nextNote(array, index) {

    nextNoteTime += triggerArray[index].nextNoteTime;
    
    if (triggerArray.length > 1){
        
        if (nextNoteCount === triggerArray.length || singleBeat){
            newBeat = false;

            isNextNote = false;
            //stop = true;
            console.log('I should stop!');
            nextNoteCount = 0;

        } else {
            nextNoteCount = nextNoteCount % triggerArray.length;
        }

        //console.log('count:' + nextNoteCount + 'value:' + array[nextNoteCount]);
        
    } else {
        nextNoteCount = 0;
        singleBeat = true;
    }
    nextNoteCount++;

    //console.log(nextNoteCount + 'array length:' + array.length);

    //console.log('the beat number:' + Math.floor(context.currentTime / oneBeat));

    

    
      // Advance the beat number, wrap to zero
    
}

var index = 0;

var oneBeat = 60 / 60;

var theBeat = 0;
var oldBeat = 0;
var contextBeat = 0;
var newBeat = true;

function checkBeat(){
    
    //oneBeat = 60 / $('#tempo').val();
    oneBeat = 60 / 60;
    contextBeat = Math.floor(context.currentTime / oneBeat);

    if (theBeat < contextBeat) {
        
        nextNoteTime = context.currentTime;
        theBeat++;

        isNextNote = true;
        console.log('played');

    }
    
    //console.log('new beat' + theBeat + 'context beat:' + Math.floor(context.currentTime / oneBeat));
}

function scheduler(triggerArray, bufferSound) {
    
    checkBeat();
    //console.log('nextNoteTime: ' + nextNoteTime);
    //console.log(newBeat);
    
    //if (nextNoteTime < context.currentTime + scheduleAheadTime && isNextNote === true) {
    while (nextNoteTime < context.currentTime + scheduleAheadTime && isNextNote === true) {
            
            
    

        index = index % triggerArray.length;

            console.log('length: ' + triggerArray.length);

            console.log('next note time:' + triggerArray[index].nextNoteTime);
            
            scheduleNote( nextNoteTime, bufferList[triggerArray[index].layer] );
            nextNote(triggerArray[index].nextNoteTime, index);
            
            
        index++;   


    }
       theBeat = Math.floor(context.currentTime / oneBeat); 
        //index++;

    // while (nextNoteTime1 < context.currentTime + scheduleAheadTime && isNextNote1 === true) {
            
    //         //console.log(triggerArray[1].length);

    //         //console.log(nextNoteTime1);

    //         //console.log('next note time:' + triggerArray[i][index]);
    //         console.log(isNextNote1);

    //         scheduleNote( nextNoteTime1, bufferList[3] );
    //         nextNote1(triggerArray[1], index1);

    //         index1++;

    //     }


    //if (theBeat === 2){
        timerID = window.setTimeout( function() {
            
                scheduler(triggerArray); 
            
        } , lookahead );

}
var beatInterval;

function play() {
    isPlaying = !isPlaying;
    
    if (isPlaying) { // start playing
        current16thNote = 0;
        console.log('played');
        //playSound( 0, bufferList[0]);
        //beatInterval = window.setInterval( function() {checkBeat();}, 25);
        console.log('triggerArray: ');
        console.log(triggerArray);

        scheduler(triggerArray);
        
        return "stop";
    } else {

        window.clearTimeout( timerID );
        clearInterval(beatInterval);
        //nextNoteCount = 0;
        console.log('stop');
        return "play";
    }
}

function playSound( time, sample) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    //console.log(sample + ',' + time);

    //console.log('TIME' + time);



    var source = context.createBufferSource();
    source.buffer = sample;
    source.connect(context.destination);
    source.start(time);

    

    console.log('index:' + index);
}

init();

