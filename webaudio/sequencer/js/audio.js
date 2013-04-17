/*
*** ONLY WORKS FOR CHROME
***
*** Unquantized sequencer using angular for sequence states
*** There's totally gonna be a chaos pad zomg
 */

// Angular sequencer app
var Sequencer = angular.module('sequencer', []);

// Samples!
var sampleArray = 
    [
        '../assets/FH2_Kick_26.wav',
        '../assets/FH2_Hat_09.wav',
        '../assets/FH2_Snare_05.wav',
        '../assets/l960big_empty_church.wav',
        //,'../assets/l960lg_brrite_chamber.wav' //nother impulse reponse
        
    ]

// Scheduling vars
var isPlaying = false;
var scheduleAheadTime = .1; //var scheduleAheadTime = 0.1; in secs
var lookahead = 25; // var lookahead = 25; in ms
var timerID = 0;
var nextNoteTime = 0;
var nextNoteCount = 0;
var singleBeat = false;
var isNextNote = true;
var index = 0;

// Teaching the computer what a beat is bars
var oneBeat = 60 / 60;
var theBeat = 0;
var contextBeat = 0;
var newBeat = true;

// Arrays filled up with important stuff (sample list, master trigger signature respectively)
var bufferList = new Array();
var triggerArray = new Array();

// Once everything is kicked off, vars for the things being triggered
var noteLength = .3;
var LFOArray;
var gain, reverb, lowpass, square, sin;

function init(){
    bindWindowActions();
    bufferLoad();
    createLFOArray();
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

  	bufferLoader.load(); // from audio-helpers.js
}

function loadCallback(buffers){
    bufferList = buffers;
}

function scheduleNote( time, bufferSound ) {
    playAsset( time, bufferSound );
}

//TODO: next note is not accurate per sequence/this is a mess.
//      ie it fires at the right time, but the time it's using to set next time is not always correct
//      I believe this has to do with the beat resetting.
function nextNote(array, index) {
    
    console.log(index);

    if (theSequence === 1) {

        if (index + 1 === triggerArray.length){
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
    if (typeof asset !== 'undefined') {
        playSample(time, asset);
    } else {
        playOsc( time );
    }
}

function playOsc( time ) {
    
    setOscGain();
    setOscReverb();
    setOscLowPassFilter();
    setOscCompressor();

    createSquareOsc( time )
    createSinOsc( time );

    configureConnections();

    /** NOTE:
        SIDE CHAIN
        need a context.send or something that doesn't connect to destination
    **/
}

/** PLUGINS **/
function setOscGain() {
    gain = context.createGainNode();
    gain.gain.value = .18;
}

function setOscReverb() {
    reverb = context.createConvolver();
    //NEED IMPULSE RESPONSE SAMPLE
    var reverbBuffer = bufferList[3];
    reverb.buffer = reverbBuffer;
}

function setOscLowPassFilter() {
    lowPass = context.createBiquadFilter();
    lowPass.type = 0; // Low-pass filter. See BiquadFilterNode docs
    //lowPass.frequency.value = 1000; // Vanilla set cutoff to static 1000 HZ
    lowPass.frequency.setValueCurveAtTime(LFOArray, context.currentTime, noteLength);
    lowPass.Q.value = 10; // filter resonance
}

function setOscCompressor() {
    oscCompressor = context.createDynamicsCompressor();
    oscCompressor.ratio.value = 200;
    oscCompressor.threshold.value = 25;
}
/** END PLUGINS **/

/** OSCILLATORS **/
function createSquareOsc( time ) {
    square = context.createOscillator();

    square.frequency.value = 100.0;
    square.gain = .5;
    square.type = 1;
    square.noteOn( time );
    square.noteOff( time + noteLength );
}

function createSinOsc( time ) {
    sin = context.createOscillator();
    sin.frequency.value = 300.0;
    sin.type = 0;

    sin.noteOn( time );
    sin.noteOff( time + noteLength );
}
/** END OSCILLATORS **/

function configureConnections() {
    square.connect( gain );
    sin.connect( gain );

    gain.connect( reverb );
    reverb.connect( lowPass );
    lowPass.connect(oscCompressor);
    oscCompressor.connect(context.destination);
}

// from http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_6
// Need to make an lfo sin multiplier for lowpass... can't figure out how to make it work like the gain example :(
function createLFOArray(){
    var DURATION = noteLength;
    var FREQUENCY = 4;
    var SCALE = 1;

    // Split the time into valueCount discrete steps.
    var valueCount = 4096;
    // Create a sinusoidal value curve.
    var values = new Float32Array(valueCount);

    for (var i = 0; i < valueCount; i++) {
        var percent = (i / valueCount) * DURATION*FREQUENCY;
        values[i] = Math.abs(1 + (Math.sin(percent * 2*Math.PI) * SCALE) * 3000); 
        // Set the last value to one, to restore playbackRate to normal at the end.
        if (i == valueCount - 1) {
            values[i] = 1 * 3000;
        }
    }

    console.log(values);

    LFOArray = values;
}

// this is a osc controlling a node example that works, but only for gain as far as I can tell
function lfodParamTest() {
    // This works, but doesn't translate to lowshelf

    var lfo = context.createOscillator();
    lfo.frequency.value = 8;
    lfo.connect(gain);

    gain.connect(gain.gain);

    lfo.start(0);
    lfo.stop(context.currentTime + noteLength);

    // This doesn't work.. don't think it does anything
    lfo.connect(lowPass);
    lowPass.connect(lowPass.frequency);
}

function playSample( time, asset ) {
    var source = context.createBufferSource();
    source.buffer = asset;

    bufferList[0].gain = 1.5; // make the bass drum louder
    console.log('index:' + index);

    /** SAMPLE COMPRESSOR **/
    sampleCompressor = context.createDynamicsCompressor();
    sampleCompressor.ratio.value = 30;
    sampleCompressor.threshold.value = 500;
    source.connect(sampleCompressor);
    sampleCompressor.connect(context.destination);

    source.start(time);
}

init();

