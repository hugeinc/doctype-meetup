Sequencer.service( 'SequencerService', [ '$rootScope', function( $rootScope ) {
    return {
        tempo: 60,
        bars: 1,
        maintainTempo : function( item ) {
            this.tempo = item;
            $rootScope.$broadcast( 'SequencerService.update', this.tempo );
        }  
    };
}]);