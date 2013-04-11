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

        for (var i = 0; i < triggerArray.length; i++) {
            unorderedTimeArray[i] = new Array();
            triggerArray[i] = new Array();
        }

        for (var i = 0; i < $scope.sequence.length; i++){
            convertedTime = $scope.convertTime($scope.sequence[i].time);
            unorderedTimeArray[$scope.sequence[i].layer].push(convertedTime);
        }
        
        for (var i= 0; i < unorderedTimeArray.length; i++) {
            triggerArray[i] = _.sortBy( unorderedTimeArray[i] );
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