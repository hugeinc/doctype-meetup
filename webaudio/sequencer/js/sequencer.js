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

        for (var i = 0; i < triggerArray.length; i++) {
            unorderedTimeArray[i] = new Array();
            triggerArray[i] = new Array();
        }

        for (var i = 0; i < $scope.sequence.length; i++){
            convertedTime = $scope.convertTime($scope.sequence[i].time);
            unorderedTimeArray[$scope.sequence[i].layer].push(convertedTime);
        }
        
        for (var i= 0; i < unorderedTimeArray.length; i++) {
            orderedTimeArray[i] = _.sortBy( unorderedTimeArray[i] );
            
            //console.log(orderedTimeArray[i]);

            timeDiffArray[i] = new Array();

            timeDiffArray[i].push(orderedTimeArray[i][0]);

            //console.log('first in time diff array:' + i + ': ' + timeDiffArray[i][0]);

            for (var j = 0; j < orderedTimeArray[i].length - 1; j++) {
                var thisValue = orderedTimeArray[i][j],
                    nextValue = (orderedTimeArray[i][j + 1] !== undefined) ? orderedTimeArray[i][j + 1] : 0;

                //console.log('next value:' + nextValue);

                timeDiffArray[i].push(nextValue - thisValue);
            }

            triggerArray[i] = timeDiffArray[i];
            //console.log('final array '+ i + ': ') 
            console.log(triggerArray[i]);
        }
    }

    $scope.convertTime = function(time) {
        var secondsPerBeat = 60.0 / $scope.tempo;
        var tempoedTime = time * secondsPerBeat;
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