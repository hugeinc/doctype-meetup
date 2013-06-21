
function fullscreen( element ) {

    if( element.requestFullscreen )

        element.requestFullscreen();

    else if( element.mozRequestFullscreen )

        element.mozRequestFullscreen();

    else if( element.webkitRequestFullscreen )

        element.webkitRequestFullscreen();
}

bespoke.plugins.coder = function( deck ) {

    function loadHTML( path, callback ) {

        $.ajax({
            url: path,
            success: callback
        });
    }

    function highlight( el, code, diffs ) {

        var html = code.split('\n');

        if ( diffs && diffs.length ) {

            for ( var i = 0; i < diffs.length; i++ ) {

                var range = diffs[i].split( '-' );
                var min = parseInt( range[0], 10 ) - 1;
                var max = parseInt( range[1], 10 ) - 1 || min;

                html[ min ] = '<span class="diff">' + html[ min ];
                html[ max ] = html[ max ] + '</span>';

                // for ( ; min < max; min++ )
                //     html[ min ] = '<span class="diff">' + html[ min ] + '</span>';
            }
        }

        el.innerHTML = html.join('\n');
    }

    function makeCode( slide, path ) {

        slide.hasCode = true;

        var code = document.createElement( 'pre' );
        code.className = 'code';

        slide.appendChild( code );

        loadHTML( path, function( data ) {

            var diff = slide.getAttribute( 'data-diff' );

            if ( diff ) {
                code.className += ' has-diff';
                diff = diff.split( ',' );
            }

            highlight( code, hljs.highlightAuto(data).value, diff );
        });
    }

    function makeDemo( slide, path ) {

        slide.hasDemo = true;

        var demo = document.createElement( 'iframe' );
        demo.className = 'demo';
        demo.src = path;

        var auto = slide.getAttribute( 'data-auto' );

        slide.appendChild( demo );

        if ( auto !== 'true' ) {

            var win;
            var rAF;
            var func;
            var play = document.createElement( 'play' );
            play.className = 'play';

            demo.onload = function() {

                win = demo.contentWindow;
                rAF = win.requestAnimationFrame;
                win.requestAnimationFrame = function( callback ) {
                    func = callback;
                };
            };

            function init() {

                play.removeEventListener( 'click', init );
                win.requestAnimationFrame = rAF;
                slide.removeChild( play );
                func();
            }

            play.addEventListener( 'click', init );
            slide.appendChild( play );
        }
    }

    deck.on( 'activate', function( event ) {

        var slide = event.slide;
        var code = slide.getAttribute( 'data-code' );
        var demo = slide.getAttribute( 'data-demo' );
        var both = slide.getAttribute( 'data-both' );

        if ( code ) makeCode( slide, code );
        if ( demo ) makeDemo( slide, demo );

        if ( both ) {
            makeCode( slide, both );
            makeDemo( slide, both );
            slide.className += ' split';
        }

        var video = slide.getAttribute( 'data-video' );

        if ( video ) {

            var player = document.createElement( 'video' );
            player.setAttribute( 'width', slide.clientWidth );
            player.setAttribute( 'src', video );
            player.setAttribute( 'autoplay', true );
            slide.appendChild( player );
            slide.hasVideo = true;

            var rv = player.clientHeight / player.clientWidth;
            var re = (slide.clientHeight-70) / slide.clientWidth;


            console.log( rv, re );

            if ( re > rv ) {
                player.style.marginTop = -45 + ((slide.clientHeight - player.clientHeight)/2) + 'px';
            }
            

            // player.style.marginTop = -45 + ((slide.clientHeight - player.clientHeight)/2) + 'px';
            // console.log(-45 + ((slide.clientHeight - player.clientHeight)/2));
        }
    });

    deck.on( 'deactivate', function( event ) {

        var slide = event.slide;

        if ( slide.hasCode || slide.hasDemo || slide.hasVideo ) {

            clearTimeout( slide.purgeTimeout );

            slide.purgeTimeout = setTimeout( function() {
                if ( slide.hasVideo ) slide.removeChild( slide.querySelector( 'video' ) );
                if ( slide.hasCode  ) slide.removeChild( slide.querySelector( '.code' ) );
                if ( slide.hasDemo  ) slide.removeChild( slide.querySelector( '.demo' ) );
            }, 1000 );
        }
    });
};

bespoke.horizontal.from( '.slides', {
    bullets: true,
    coder: true,
    hash: true
});

// On load
$( document ).ready( function() {

    // Format `pre` blocks
    $( 'pre.snippet' ).each( function( index, el ) {

        var lines = el.textContent.split('\n');
        var min = Number.POSITIVE_INFINITY;
        var i, n, m;

        // Strip empty line from the end
        if ( !/\w/.test( lines[ lines.length - 1 ] ) ) lines.pop();

        // Find the minimum indentation level
        for ( i = 0, n = lines.length; i < n; i++ ) {
            m = lines[i].match( /^\s+(?=\w)/ );
            if ( m ) min = Math.min( min, m[0].length );
        }

        var regex = new RegExp( '^\\s{' + min + '}' );
        var comment = /^\/\//;

        // Strip out redundant indentation
        for ( i = 0, n = lines.length; i < n; i++ ) {

            lines[i] = lines[i].replace( regex, '' );

            if ( comment.test( lines[i] ) )
                lines[i] = '<span class="comment">' + lines[i] + '</span>';
        }

        el.innerHTML = lines.join( '\n' );

        //hljs.highlightBlock(e);
    });
});