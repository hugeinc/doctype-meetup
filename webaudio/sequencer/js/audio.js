/*
*** ONLY WORKS FOR CHROME
***
*** Unquantized sequencer using angular for sequence states
*** There's totally a chaos pad zomg (it wasn't until after a while my friend pointed out it's kaos. no regrets)
 */

// kick off angular sequencer app
var Sequencer = angular.module('sequencer', []);

// Samples!
var sampleArray = 
    [
        'assets/FH2_Kick_26.wav',
        'assets/FH2_Hat_09.wav',
        'assets/FH2_Snare_05.wav',
        //'assets/l960big_empty_church.wav'
        //'../assets/littlebomber_-_Oogregre.mp3'
        'assets/l960lg_brrite_chamber.wav' //nother impulse reponse
        
    ]
bufferLoaded = false;

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

// Teaching the computer what a beat is vars
var oneBeat = 60 / 60;
var theBeat = 0;
var contextBeat = 0;
var newBeat = true;

// Arrays filled up with important stuff (sample list, master trigger signature, routing order respectively)
var bufferList = new Array();
var triggerArray = new Array();
var routeArray = new Array();

// Once everything is kicked off, vars for the things being triggered
var noteLength = .3;
var LFOArray;
var gain, reverb, lowPass, square, sin;

// chaos pad
var $pad = $('#chaos-pad');
var $padWidth = $pad.width(),
    $padHeight = $pad.height();
var cursorX, cursorY;
var lowPassIsOn = false,
    freqIsOn = false;

function init(){
    bindWindowActions();
    bufferLoad();
    createLFOArray();
    //initSpectrumBox();
    bindRouter();
    checkChaosSettings();
    chaosPad();
    
}

function bindWindowActions(){
    $(document).on('keydown', function(e){
        bindPlay(e);
        //bindNyan(e);
    });
}

function bindPlay(e){
    if (e.which === 32) {
        e.preventDefault();
        play(bufferList);
    }
}

function bindNyan(e){
    if (e.which === 78) {
        playNyan();
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
    bufferLoaded = true;
    $('.loading').addClass('hidden');
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
    
    if (bufferLoaded) {
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

    
}

function scheduler(triggerArray, bufferSound) {
    
    checkBeat();
    
    while (nextNoteTime < context.currentTime + scheduleAheadTime && isNextNote === true) {
        
        index = index % triggerArray.length;
        scheduleNote( nextNoteTime, bufferList[triggerArray[index].layer] );
        
        console.log('NEXT NOTE TIME: ' + nextNoteTime);
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

/** TODO: Pretty sure the effects don't need **/
function playOsc( time ) {

    setOscGain();
    setOscReverb();
    setOscLowPassFilter();
    setOscCompressor();

    createSquareOsc( time )
    createSinOsc( time );

    configureConnections();

}

/** PLUGINS **/
function setOscGain() {
    gain = context.createGainNode();
    gain.gain.value = .2;
}

function setOscReverb() {
    reverb = context.createConvolver();
    //NEED IMPULSE RESPONSE SAMPLE
    var reverbBuffer = bufferList[3];
    reverb.buffer = reverbBuffer;

    //routeArray.push(reverb);
}

function setOscLowPassFilter() {
    lowPass = context.createBiquadFilter();
    lowPass.type = 0; // Low-pass filter. See BiquadFilterNode docs
    //lowPass.frequency.value = 1000; // Vanilla set cutoff to static 1000 HZ
    lowPass.frequency.setValueCurveAtTime(LFOArray, context.currentTime, noteLength);
    lowPass.Q.value = 10; // filter resonance

    //routeArray.push(lowPass);
}

function setOscCompressor() {
    oscCompressor = context.createDynamicsCompressor();
    oscCompressor.ratio.value = 200;
    oscCompressor.threshold.value = 25;

    //routeArray.push(oscCompressor);
}
/** END PLUGINS **/

/** OSCILLATORS **/
function createSquareOsc( time ) {
    square = context.createOscillator();

    square.frequency.value = (freqIsOn) ? 100.0 * cursorX : 100.0;
    square.gain = .5;
    square.type = 1;
    square.noteOn( time );
    square.noteOff( time + noteLength );
}

function createSinOsc( time ) {
    sin = context.createOscillator();
    sin.frequency.value = (freqIsOn) ? 200.0 * cursorY : 200.0;
    sin.type = 0;

    sin.noteOn( time );
    sin.noteOff( time + noteLength );
}
/** END OSCILLATORS **/

/** KAOS PAD **/
function chaosPad() {
    // for chaos pad x and y
    cursorY = 0;
    cursorX = 0;

    $pad.mousemove(function(e){

        /** TODO: only change these when the command key is on **/

        cursorX = (window.Event) ? e.pageX : event.clientX;
        cursorX = cursorX - $pad.offset().left;
        cursorY = (window.Event) ? e.pageY : event.clientY;
        cursorY = cursorY - $pad.offset().top;

        var section = $padWidth * 30;

        cursorX = Math.floor($padWidth / section * cursorX) * .1 * 2.5 + .1;
        cursorY = Math.floor($padWidth / section * cursorY) * .1 * 5 + .1;

        console.log('CURSOR Y' + cursorY);

        createLFOArray();

    });
    
}

function checkChaosSettings() {
    var $input = $('#chaos-settings').find('input');
    var $lowpass = $('#chaos-lowpass');
    var $freq = $('#chaos-freq');

    $input.click(function() {
        lowPassIsOn = ($lowpass.prop('checked') === true) ? true : false;
        freqIsOn = ($freq.prop('checked') === true) ? true : false;

        console.log('lowpass is on: ' + lowPassIsOn + ', freq is on:' + freqIsOn);
    });
}

/** OSC ROUTING **/
/** TODO: make routing dynamic **/
function bindRouter() {
    var $routerOptions = $('#router').find('input');

    $routerOptions.click(function(e){
        routeArray = new Array();

        $routerOptions.each(function(){
            var $this = $(this);

            if ($this.prop('checked') === true) {

                if ($(this).attr('id') === 'reverb') {
                    routeArray.push( 'reverb' );
                } else if ($(this).attr('id') === 'lowpass') {
                    routeArray.push( 'lowPass' );
                }
            }
                
        });

    });
}
function configureConnections() {
    square.connect( gain );
    sin.connect( gain );

    console.log('routeArray.length'+routeArray.length);

    if (routeArray.length === 0) {
        gain.connect( oscCompressor );
    } else {

        var i=0;

        if (routeArray[i] === 'reverb') {
            gain.connect( reverb );
            if (routeArray[i + 1] === undefined) {
                //alert(routeArray[i + 1]);
                reverb.connect(oscCompressor);
            } else {
                reverb.connect(lowPass);
                lowPass.connect(oscCompressor);
            }
            i++;
        } 

        if (routeArray[i] === 'lowPass') {
            gain.connect( lowPass );
            lowPass.connect(context.destination);
            i++;
        } 

        //didn't work with lfo, but did with reverb
        //gain.connect( routeArray[i] );
        //routeArray[i].connect( context.destination );

    }
    
    oscCompressor.connect(context.destination);

}

// from http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_6
// Need to make an lfo sin multiplier for lowpass... can't figure out how to make it work like the gain example :(
function createLFOArray() {
    var DURATION = noteLength;
    var FREQUENCY = (lowPassIsOn) ? 2.0 * cursorY : 2.0;
    //var FREQUENCY = 2 * cursorY;
    var SCALE = 1;

    var chaosFreqMultiplier = 3000 * cursorX;

    // Split the time into valueCount discrete steps.
    var valueCount = 4096;
    // Create a sinusoidal value curve.
    var values = new Float32Array(valueCount);

    for (var i = 0; i < valueCount; i++) {
        var percent = (i / valueCount) * DURATION*FREQUENCY;
        values[i] = Math.abs(1 + (Math.sin(percent * 2 * Math.PI) * SCALE) * ((lowPassIsOn) ? chaosFreqMultiplier : 3000)); 
        // Set the last value to one, to restore playbackRate to normal at the end.
        if (i == valueCount - 1) {
            values[i] = 1 * ((lowPassIsOn) ? chaosFreqMultiplier : 3000);
        }
    }

    //console.log(values);

    LFOArray = values;
}

// visualizer didn't work for some reason
function initSpectrumBox() {

    wavebox = new SpectrumBox(2048, 1000, 'spectrum', context);
    wavebox.setType(SpectrumBox.Types.TIME);
    wavebox.getCanvasContext().fillStyle = "#da4f49";
    // visualNodes.push(wavebox);
    // wavebox.getAudioNode();

    // alert('sup');
}

// this is an osc controlling a node example that works, but only for gain as far as I can tell
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

/**
    nyan.. not gonna, rampto needs to be tested more, wasn't working as per example
    http://chimera.labs.oreilly.com/books/1234000001552/ch02.html#s02_5
**/

function playNyan() {
    if (bufferLoaded) {
        var source = context.createBufferSource();
        source.buffer = bufferList[4];
        

        nyanGain = context.createGainNode();
        //nyanGain.gain.value = 0;

        nyanGain.gain.linearRampToValueAtTime(.5, context.currentTime + 20);

        // setTimeout(function(){
        //     nyanGain.gain.exponentialRampToValueAtTime(0, context.currentTime + 4);
        // }, 4.5);

        source.connect(nyanGain);
        nyanGain.connect(context.destination);

        source.start(0);
        console.log(source);
    }
    
}


init();

