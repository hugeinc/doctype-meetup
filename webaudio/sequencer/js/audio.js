angular
    .module( 'sequencer', [] )
        .service( 'SequencerService', [ '$rootScope', function( $rootScope ) {
            return {
                tempo: 60,
                bars: 1,
                maintainTempo : function( item ) {
                    this.tempo = item;
                    $rootScope.$broadcast( 'SequencerService.update', this.tempo );
                }  
            };
        }])
        .controller( 'Transport', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
            $scope.tempo = SequencerService.tempo;
            $scope.start = 0;
            $scope.end = 10;

            $scope.computeLength = function(){
                $scope.length = ($scope.end - $scope.start) * (60 / $scope.tempo);
            }

            $scope.updateTempo = function() {
                SequencerService.maintainTempo( $scope.tempo );  
            };

            $scope.$on( 'SequencerService.update', function( event, tempo ) {
                $scope.tempo = tempo;
            });

            $scope.computeLength();
        }])
        .controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
            $scope.init = function(){
                console.log($scope.sequence);

                $scope.createTimeArrays();
            }

            $scope.tempo = SequencerService.tempo;
            
            $scope.sequence = [
                {
                    layer: 0,
                    //time: $scope.getTime(0)
                    time: 0 //in bars
                },
                {
                    layer: 0,
                    time: .25
                },
                {
                    layer: 0,
                    time: .5
                },
                {
                    layer: 0,
                    time: .75
                },
                {
                    layer: 1,
                    //time: $scope.getTime(0)
                    time: 0 //in bars
                },
                {
                    layer: 2,
                    time: .25
                },
                {
                    layer: 0,
                    time: .5
                },
                {
                    layer: 3,
                    time: .75
                }
            ]

            $scope.createTimeArrays = function(){
                //make layers dynamic?
                
                for (var i = 0; i < $scope.sequence.length; i++){
                    console.log($scope.sequence[i].layer);

                    triggerArray[$scope.sequence[i].layer].push($scope.sequence[i].time);
                }
                console.log('array1?:')
                console.log(triggerArray[0]);
                console.log(triggerArray[1]);
                console.log(triggerArray[2]);
                console.log(triggerArray[3]);
            }

            $scope.$on( 'SequencerService.update', function( event, tempo ) {
                $scope.tempo = tempo;
            });

            $scope.init();
        }]);


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

    var eighthNoteTime = .2, //in seconds
        startTime = 0;

    scheduler(bufferList);

    // for (var bar = 0; bar < 2; bar++) {
    //     //this is length
    //     var time = startTime + bar * 8 * eighthNoteTime;
        
    //     /***
    //     **  https://github.com/cwilso/metronome/blob/master/js/metronome.js
    //     **  Think I need a schedular per sound?
    //     **/



    //     // Play the bass (kick) drum on beats 1, 5
    //     playSound(bufferList[0], time);
    //     playSound(bufferList[0], time + 4 * eighthNoteTime);

    //     // Play the snare drum on beats 3, 7
    //     playSound(bufferList[3], time + 2 * eighthNoteTime);
    //     playSound(bufferList[3], time + 6 * eighthNoteTime);

    //     // Play the hihat every eighth note.
    //     for (var i = 0; i < 8; ++i) {
    //         playSound(bufferList[2], time + i * eighthNoteTime);
    //     }
    // }
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


function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;  // Notice this picks up the CURRENT 
                      // tempo value to calculate beat length.

    /***
    **  So the next note needs to be calculated from an array that I make.
    **/

    nextNoteTime += 0.25 * secondsPerBeat;  // Add beat length to last beat time

    current16thNote++;  // Advance the beat number, wrap to zero
    if (current16thNote == 16) {
        current16thNote = 0;
    }
}

// function scheduler() {
//     // while there are notes that will need to play before the next interval, 
//     // schedule them and advance the pointer.
//     while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
//         scheduleNote( current16thNote, nextNoteTime );
//         nextNote();
//     }
//     timerID = window.setTimeout( scheduler, lookahead );
// }


init();

