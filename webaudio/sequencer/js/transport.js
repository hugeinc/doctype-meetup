Sequencer.controller( 'Transport', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    $scope.tempo = SequencerService.tempo;
    $scope.start = 0;
    $scope.end = 10;

    $scope.computeLength = function(){
        $scope.length = ($scope.end - $scope.start) * (60 / $scope.tempo);
    }

    $scope.updateTempo = function() {
        SequencerService.maintainTempo( $scope.tempo );  
        $('#sequencer-tempo').trigger('change');
    };

    $scope.$on( 'SequencerService.update', function( event, tempo ) {
        $scope.tempo = tempo;
    });

    $scope.computeLength();
}])