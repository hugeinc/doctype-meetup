Sequencer.controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    
    $scope.tempo = SequencerService.tempo;
    $scope.sequence = sequenced; //in sequence.js
    $scope.timeArrayByLayer = new Array();
    $scope.displayTimeArrayByLayer = new Array();

    $scope.hasPlayed = false;
    $scope.init = function(){
        console.log($scope.sequence);

        //$scope.createTimeArrays();
    }

    /***
    **  Derives the array audio.js uses to fire which sound when
    **  The array has properties: layer, time, and nextNoteTime, ordered by time
    */
    $scope.createTimeArrays = function(){
        $scope.setUpLayers();
        $scope.seperateTimesByLayer();
        $scope.combineLayers();
        $scope.calculateNextNoteTime();
    }

    // Sets up sequence arrays by layer
    $scope.setUpLayers = function() {
        $scope.layers = 0;

        $scope.sequence = _.sortBy($scope.sequence, 'layer');
        $scope.layers = $scope.sequence[$scope.sequence.length - 1].layer;

        for (var i = 0; i < $scope.layers + 1; i++) {
            $scope.timeArrayByLayer[i] = new Array();
            $scope.displayTimeArrayByLayer[i] = new Array();
        }
    }

    //TODO, make display left percent divided by bars

    // seperate scope.sequence into layers for display
    $scope.seperateTimesByLayer = function() {
        for (var i = 0; i < $scope.sequence.length; i++) {

            var time = $scope.sequence[i].time;
            var timeString = time + '';
            var strippedTime = (timeString !== '0') ? timeString.split('.')[1] : '0';
            
            console.log(time + ',' + strippedTime)

            strippedTime = (strippedTime.length === 1) ? strippedTime + '0' : strippedTime;
            $scope.displayTimeArrayByLayer[$scope.sequence[i].layer].push(strippedTime);
            $scope.timeArrayByLayer[$scope.sequence[i].layer].push(time);
        }
    }

    // combines the layers into triggerArray, sets properties time, and layer.
    // Converts time by tempo when time is set
    $scope.combineLayers = function() {
        var triggerArrayIndex = 0;

        for (var i = 0; i < $scope.layers + 1; i++){
            $scope.timeArrayByLayer[i] = _.sortBy( $scope.timeArrayByLayer[i] );

            console.log($scope.timeArrayByLayer[i]);

            //console.log($scope.timeArrayByLayer[i]);

            for (var j = 0; j < $scope.timeArrayByLayer[i].length; j++) {
                triggerArray[triggerArrayIndex] = new Array;

                var trigger = triggerArray[triggerArrayIndex];

                trigger.time = $scope.convertTime($scope.timeArrayByLayer[i][j]);
                trigger.layer = i;

                //console.log('trigger array j: ' + triggerArrayIndex);
                triggerArrayIndex++;
            }
        }
    }

    // Since two things set at .25 bars need to fire at the same time, we subtract the last value from the current one, 
    // so the second sound starts at 0.. right when the other one fires at .25
    $scope.calculateNextNoteTime = function() {
        triggerArray = _.sortBy(triggerArray, 'time');

        for (var i = 0; i < triggerArray.length; i++){
            var thisValue = triggerArray[i].time,
                lastValue = (i > 0) ? triggerArray[i - 1].time : 0;

            triggerArray[i].nextNoteTime = thisValue - lastValue;
        }
    }

    $scope.convertTime = function(time) {
        var secondsPerBeat = 60.0 / $scope.tempo;
        var tempoedTime = time * secondsPerBeat;
        return (tempoedTime);
    }

    $scope.addTrigger = function() {
        alert('sup');
    }

    $scope.$on( 'SequencerService.update', function( event, tempo ) {
        $scope.tempo = tempo;
        oneBeat = 60 / $('#tempo').val();
    });

    $scope.$watch('tempo', function(value) {
        // In the gheetttoooooooo

        if ($scope.hasPlayed) {
            play();
        }

        $scope.createTimeArrays();

        if($scope.hasPlayed) {
            setTimeout(play, 300);
        }

        if(!$scope.hasPlayed){
            $scope.hasPlayed = true;
        }

    });

    $scope.init();

}]);