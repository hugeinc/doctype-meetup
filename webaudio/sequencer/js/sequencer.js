Sequencer.controller( 'Sequencer', [ 'SequencerService', '$scope', function( SequencerService, $scope ) {
    
    $scope.tempo = SequencerService.tempo;

    // biggest bug here, if I make the index for next note + 1 this app break but is accurate for a whole squence, 
    //                   if it's just index it loops and a beat is accurate, but next note fires inaccurately
    theSequence = 1;
    if (theSequence === 1) {
        $scope.sequence = sequenced1;
    } else { 
        $scope.sequence = sequenced;
    }

    $scope.removing = false;
    $scope.hasPlayed = false;

    $scope.timeArrayByLayer = new Array();
    $scope.displayTimeArrayByLayer = new Array();

    $scope.init = function(){
        console.log($scope.sequence);
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
        $scope.findHowManyBars();
    }

    // finds out how many bars there are in the sequence
    $scope.findHowManyBars = function() {
        $scope.sequence = _.sortBy($scope.sequence, 'time');
        $scope.bars = Math.ceil($scope.sequence[$scope.sequence.length - 1].time);
    }

    // seperate scope.sequence into layers for display
    $scope.seperateTimesByLayer = function() {
        for (var i = 0; i < $scope.sequence.length; i++) {
            var time = $scope.sequence[i].time;
            var displayTime = time * 100;
            
            //console.log('layer: ' + $scope.sequence[i].layer + ', time: '+ time + ',' + displayTime);

            displayTime = (displayTime / $scope.bars);
            $scope.displayTimeArrayByLayer[$scope.sequence[i].layer].push(displayTime);

            // TODO: make seperate array with id, put in layers too, also need to make a scope count, so when I add a new one it's unique
            $scope.timeArrayByLayer[$scope.sequence[i].layer].push(time);
        }
    }

    // combines the layers into triggerArray, sets properties time, and layer.
    // Converts time by tempo when time is set ($scope.convertTime())
    $scope.combineLayers = function() {
        var triggerArrayIndex = 0;

        for (var i = 0; i < $scope.layers + 1; i++){
            $scope.timeArrayByLayer[i] = _.sortBy( $scope.timeArrayByLayer[i] );

            console.log($scope.timeArrayByLayer[i]);

            for (var j = 0; j < $scope.timeArrayByLayer[i].length; j++) {
                triggerArray[triggerArrayIndex] = new Array;

                var trigger = triggerArray[triggerArrayIndex];
                trigger.time = $scope.convertTime($scope.timeArrayByLayer[i][j]);
                trigger.layer = i;
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

    // converts time based on tempo
    $scope.convertTime = function(time) {
        var secondsPerBeat = 60.0 / $scope.tempo;
        var tempoedTime = time * secondsPerBeat;
        return (tempoedTime);
    }

    /** TODO: triggers correctly, but need to make this work after I get the nextnote stuff worked out **/
    $scope.addTrigger = function() {
        if (!$scope.removing) {
            //alert('add');
        }
        $scope.removing = false;
    }
    $scope.removeTrigger = function() {
        //alert('remove');
        $scope.removing = true;
    }

    // watches service (global vars) for changes
    $scope.$on( 'SequencerService.update', function( event, tempo ) {
        $scope.tempo = tempo;
        oneBeat = 60 / $('#tempo').val();
    });

    $scope.$watch('tempo', function(value) {
        // Hacky, if I change the tempo while it's changing the schedular borks
        //        but ifI stop it for a sec, then start again it seems to be solid  

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