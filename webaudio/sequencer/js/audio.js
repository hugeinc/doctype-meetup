(function($) {

    var sampleArray = 
        [
            '../assets/FH2_Kick_26.wav',
            '../assets/FH2_Crash_02.wav',
            '../assets/FH2_Hat_09.wav',
            '../assets/FH2_Snare_05.wav'
        ]

    var bufferList = new Array();

    function init(){
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

    function loadCallback(bufferList){
        play(bufferList);
    }

    function play(bufferList){

        var eighthNoteTime = .2, //in seconds
            startTime = 0;

        for (var bar = 0; bar < 2; bar++) {
            var time = startTime + bar * 8 * eighthNoteTime;
            // Play the bass (kick) drum on beats 1, 5
            playSound(bufferList[0], time);
            playSound(bufferList[0], time + 4 * eighthNoteTime);

            // Play the snare drum on beats 3, 7
            playSound(bufferList[3], time + 2 * eighthNoteTime);
            playSound(bufferList[3], time + 6 * eighthNoteTime);

            // Play the hihat every eighth note.
            for (var i = 0; i < 8; ++i) {
                playSound(bufferList[2], time + i * eighthNoteTime);
            }
        }
    }

    function playSound(sample, time) {
        var source = context.createBufferSource();
        source.buffer = sample;
        source.connect(context.destination);
        source.start(time);
    }

    init();

})(jQuery);
