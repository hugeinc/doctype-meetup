Sequencer.controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    
    $scope.tempo = SequencerService.tempo;
    $scope.sequence = sequenced; //in sequence.js

    $scope.init = function(){
        console.log($scope.sequence);

        //$scope.createTimeArrays();
    }

    $scope.createTimeArrays = function(){

        var convertedTime = 0;
        var unorderedTimeArray = new Array();
        var orderedTimeArray = new Array();

        // so with next note, when you have a .25 and .5 
        // for quarter beat, what you actually want to scedule is the difference, ie, .25 then .25 again.
        var timeDiffArray = new Array();

        var testTriggerArray = new Array();

        // for (var i = 0; i < triggerArray.length; i++) {
        //      //unorderedTimeArray[i] = new Array();
        //      triggerArray[i] = new Array();
        //  }

         unorderedTimeArray[0] = new Array();
         unorderedTimeArray[1] = new Array();
         unorderedTimeArray[2] = new Array();
         unorderedTimeArray[3] = new Array();

        // seperate scope.sequence into layers to sort by time
        for (var i = 0; i < $scope.sequence.length; i++){

            triggerArray[i] = new Array;

            unorderedTimeArray[$scope.sequence[i].layer].push($scope.sequence[i].time);

        }


        /**
            I DON'T THINK I NEED THIS
        **/
        // make times the DIFFERENCE between the notes for scheduling, not the percentage of a bar
        // ie, if the sequence was .25, .5, the second value would fire .5 seconds after the first, not .25 like we want.
        // also converts that second difference based on tempo (bpm);
        for (var i = 0; i < unorderedTimeArray.length; i++){

            timeDiffArray[i] = new Array();
            orderedTimeArray[i] = new Array();

            orderedTimeArray[i] = _.sortBy( unorderedTimeArray[i] );

            timeDiffArray[i].push($scope.convertTime(orderedTimeArray[i][0]));
            //console.log(timeDiffArray[i]);
            for (var j = 0; j < orderedTimeArray[i].length - 1; j++) {
                var thisValue = orderedTimeArray[i][j],
                    nextValue = (orderedTimeArray[i][j + 1] !== undefined) ? orderedTimeArray[i][j + 1] : 0;


                timeDiffArray[i].push($scope.convertTime(nextValue - thisValue));
            }
            //convertedTime = $scope.convertTime(unorderedTimeArray[i], $scope.sequence[i].time, $scope.sequence[i].layer);
        }

        //put arrays together into a master array, sort by time
        
        var triggerArrayIndex = 0;

        for (var i = 0; i < timeDiffArray.length; i++){
            //console.log(timeDiffArray.length);
            //console.log('timeDiffArray i' + i);
            //console.log('layer number:' + unorderedTimeArray.length);

            for (var j = 0; j < timeDiffArray[i].length; j++) {
                var trigger = triggerArray[triggerArrayIndex];

                trigger.time = orderedTimeArray[i][j];

                trigger.nextNoteTime = timeDiffArray[i][j];
                trigger.layer = i;

                //console.log('trigger array j: ' + triggerArrayIndex);
                triggerArrayIndex++;
            }
        }

        //console.log('converted: ');
        console.log(timeDiffArray);

        triggerArray = _.sortBy(triggerArray, 'time');

        //finaly, we must loop through times, and subtract last time value from this time value in that order to calculate next note time, 
        // ie, if we have two sounds scheduled at .25 bars, it will fire the first, then the next .25 bars later instead of the same time

        for (var i = 0; i < triggerArray.length; i++){
            var thisValue = triggerArray[i].time,
                lastValue = (i > 0) ? triggerArray[i - 1].time : 0;

            triggerArray[i].nextNoteTime = thisValue - lastValue;
        }

    }

    $scope.convertTime = function(time) {
        var secondsPerBeat = 60.0 / $scope.tempo;
        var tempoedTime = time * secondsPerBeat;

        //var nextValue = (orderedTimeArray[i][j + 1] !== undefined) ? orderedTimeArray[i][j + 1] : 0;

        return (tempoedTime);
    }

    $scope.$on( 'SequencerService.update', function( event, tempo ) {
        $scope.tempo = tempo;
    });

    $scope.$watch('tempo', function(value) {
        $scope.createTimeArrays();
    });

    $scope.init();

}]);