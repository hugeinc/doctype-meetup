Sequencer.controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    $scope.init = function(){
        console.log($scope.sequence);

        $scope.createTimeArrays();
    }

    $scope.tempo = SequencerService.tempo;
    
    $scope.sequence = sequenced; //in sequence.js

    $scope.createTimeArrays = function(){
        //make layers dynamic?
        
        for (var i = 0; i < $scope.sequence.length; i++){
            console.log($scope.sequence[i].layer);

            triggerArray[$scope.sequence[i].layer].push($scope.sequence[i].time);

            console.log('trigger array' + i + ': ' );
            console.log(triggerArray[i]);
        }
    }

    $scope.$on( 'SequencerService.update', function( event, tempo ) {
        $scope.tempo = tempo;
    });

    $scope.init();
}]);