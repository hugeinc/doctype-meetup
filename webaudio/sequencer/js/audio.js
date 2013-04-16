var Sequencer = angular.module('sequencer', []);

var sampleArray = 
    [
        '../assets/FH2_Kick_26.wav',
        '../assets/FH2_Hat_09.wav',
        '../assets/FH2_Snare_05.wav',
        '../assets/l960big_empty_church.wav'
        //,'../assets/l960lg_brrite_chamber.wav' //nother impulse reponse
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

var square, sin = null;
var noteLength = .3;

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
    playAsset( time, bufferSound );
}

function nextNote(array, index) {
    
    console.log(index);

    if (theSequence === 1) {

        if(index + 1 === triggerArray.length){
            index = 0;
        }
        nextNoteTime += triggerArray[index + 1].nextNoteTime;
    } else {
        nextNoteTime += triggerArray[index].nextNoteTime;
    }

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
        
        console.log('NEXT NOTE TIME: '+nextNoteTime);
        nextNote(triggerArray[index].nextNoteTime, index);
        
        index++;   

    }
    
    theBeat = Math.floor(context.currentTime / oneBeat); 

    timerID = window.setTimeout( function() {
        scheduler(triggerArray); 
    } , lookahead );

}

function playAsset( time, asset) {
    /***
    ** NOTE: needs to be reset every time it's played,
    */
    console.log(typeof asset);
    if (typeof asset !== 'undefined') {
        playSample(time, asset);
    } else {
        playOsc( time );
        console.log('osc TIME: ' + time);
    }
    
}
var LFOArray;
createLFOArray();


function playOsc( time ) {
    

    /* TRYING lfo on gain */
    var lfo = context.createOscillator();
    lfo.frequency.value = 8;


    //gain node at zero is a bus https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
    gain = context.createGainNode();
    gain.gain.value = .18;

    reverb = context.createConvolver();

    //NEED IMPULSE RESPONSE SAMPLE
    var reverbBuffer = bufferList[3];


    reverb.buffer = reverbBuffer;

    var lowPass = context.createBiquadFilter();
    lowPass.type = 0; // Low-pass filter. See BiquadFilterNode docs
    //lowPass.frequency.value = 9000; // Set cutoff to 440 HZ
    lowPass.frequency.setValueCurveAtTime(LFOArray, context.currentTime, noteLength);

    lowPass.Q.value = 10;

    console.log('LOWPASS: ');
    console.log(lfo);


    compressor1 = context.createDynamicsCompressor();

    compressor1.ratio.value = 200;
    compressor1.threshold.value = 25;

    //dun work
    compressor1.connect(context.destination);
    //compressor1.connect(context.destination);
    lowPass.connect(compressor1);
    reverb.connect(lowPass);

    console.log(gain);

    // This works, but doesn't translate to lowshelf

    // lfo.connect(gain);

    //gain.connect(gain.gain);

    lfo.start(0);
    lfo.stop(context.currentTime + noteLength);

    // This doesn't work.. don't think it does anything
    lfo.connect(lowPass);
    lowPass.connect(lowPass.frequency);


    // setInterval(function(){
    //     if (isPlaying){
    //         console.log('gain', gain);
    //     }
    // }, 25);

    gain.connect( reverb );

    square = context.createOscillator();
    square.connect( gain );

    square.frequency.value = 100.0;
    square.gain = .5;
    square.type = 1;
    console.log('square: ' + square);
    // TODO: Once start()/stop() deploys on Safari and iOS, these should be changed.
    square.noteOn( time );
    square.noteOff( time + noteLength );


    sin = context.createOscillator();
    sin.connect( gain );

    sin.frequency.value = 300.0;
    sin.type = 0;
    console.log('sin: ' + sin);
    // TODO: Once start()/stop() deploys on Safari and iOS, these should be changed.
    sin.noteOn( time );
    sin.noteOff( time + noteLength );

}


// from http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_6
// Need to make an lfo sin multiplier for lowpass... can't figure out how to make it work like the gain example :(
function createLFOArray(){
    var DURATION = noteLength;
    var FREQUENCY = 2;
    var SCALE = 1;

    // Split the time into valueCount discrete steps.
    var valueCount = 4096;
    // Create a sinusoidal value curve.
    var values = new Float32Array(valueCount);

    for (var i = 0; i < valueCount; i++) {
        var percent = (i / valueCount) * DURATION*FREQUENCY;
        values[i] = Math.abs(1 + (Math.sin(percent * 2*Math.PI) * SCALE) * 5000); 
        // Set the last value to one, to restore playbackRate to normal at the end.
        if (i == valueCount - 1) {
            values[i] = 1 * 5000;
        }
    }

    console.log(values);

    LFOArray = values;
}

function playSample( time, asset ) {
    var source = context.createBufferSource();
    source.buffer = asset;

    compressor = context.createDynamicsCompressor();

    compressor.ratio.value = 8;
    compressor.threshold.value = 500;

    console.log(compressor);

    source.connect(compressor);

    compressor.connect(context.destination);

    source.start(time);

    console.log('index:' + index);
}



init();

