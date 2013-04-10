$(window).load(function(){


	$('pre').each(function(key, value){
		if(!$(value).hasClass('structure')){
			$(this).text($(this).html());
		}

	});


	/* Table of Contents Navigation */

	var titleAll = [],
		titleSection = [],
		hashTag = [],
		k = 0,
		menuContainer = $('.menu-container'),
		menu = $('.menu'),
		slide = $('.slide'),
		section = $('.section');

	//find all the titles and sections
	slide.each(function(key, value){
		var title = findTitles(value);
		titleAll.push(title);
	});

	section.each(function(key,value){
		var title = findTitles(value);
		titleSection.push(title);
	});

	function findTitles(el) {
		var title = $(el).find('h1:first').text();
		if (!title) {
			title = $(el).find('h4:first').text();
		}
		return title;
	}

	//compare all slides to section slides and find the url hashTag for section slides
	for (var i=0; i < titleAll.length; i++) {
		if( titleAll[i] === titleSection[k] ) {
			//add one to account for slideshow starting at 1
			var index = i + 1;
			hashTag.push(index);
			//increment titleSection array
			k = k+1;
		}
	}

	//populate menu
	for (var j=0; j < titleSection.length; j++) {
		menu.append("<li><a href='#"+hashTag[j]+"'>"+titleSection[j]+"</a></li>");
	}

	//populate start/finish links
	menuContainer.append('<div class="fast-nav"><a href="#1">Start</a><a href="#'+titleAll.length+'">Finish</a></div>');

	//change pages
	menuContainer.on('click', 'a', function(event) {
		window.location.href = $(this).attr('href');
		window.location.reload();
	});

	//menu keyboard commands to show/hide, start/finsh
	$(window).keypress(function(e) {
		if(e.keyCode == 109){
			menuContainer.toggle();
		}
	});
	

});
