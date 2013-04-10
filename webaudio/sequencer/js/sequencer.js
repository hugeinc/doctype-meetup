Sequencer.controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    
    $scope.tempo = SequencerService.tempo;
    $scope.sequence = sequenced; //in sequence.js

    $scope.init = function(){
        console.log($scope.sequence);

        $scope.createTimeArrays();
    }

    
    console.log('first time');
    console.log($scope.sequence[1].time)

    $scope.createTimeArrays = function(){
        //make layers dynamic?
        //

        var convertedTime = 0;

        for (var i = 0; i < triggerArray.length; i++) {
            triggerArray[i] = [];
        }

        for (var i = 0; i < $scope.sequence.length; i++){
            convertedTime = $scope.convertTime($scope.sequence[i].time);

            console.log($scope.sequence[i].layer);

            triggerArray[$scope.sequence[i].layer].push(convertedTime);
            
        }

        console.log('trigger array: ' );
            console.log(triggerArray[0]);
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