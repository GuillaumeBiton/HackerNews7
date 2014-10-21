(function (Framework7, $$, T7, moment, hnapi) {
	'use strict';

	// Helpers
	T7.registerHelper('time_ago', function (time) {
		return moment.unix(time).fromNow();
	});
	T7.registerHelper('array_length', function (arr) {
		return arr ? arr.length : 0;
	});
	
	// Init App
	var app = new Framework7({
		modalTitle: 'HackerNews7',
		
		animateNavBackIcon: true,
		
		precompileTemplates: true,
		template7Pages: true
	});
	
	// Add View
	var mainView = app.addView('.view-main', {
		dynamicNavbar: true
	});
	
	// Update data
	function updateStories(stories) {
		app.template7Data.stories = stories;
		$$('.page[data-page="index"] .page-content .list-block').html(T7.templates.storiesTemplate(stories));
	}
	// Fetch Stories
	function getStories(refresh) {
		var results = refresh ? [] : JSON.parse(window.localStorage.getItem('stories')) || [];
		if (results.length === 0) {		
			if (!refresh) app.showPreloader('Loading top stories : <span class="preloader-progress">0</span> %');
			var storiesCount = 0;
			hnapi.topStories(function (data) {
				data = JSON.parse(data);
				data.forEach(function(id) {
					hnapi.item(id, function(data) {
						data = JSON.parse(data);
						data.domain = (data.url) ? data.url.split('/')[2] : '';
						results.push(data);
						storiesCount++;
						$$('.preloader-progress').text(Math.floor(storiesCount/100*100));
						if (results.length === 100) {
							if (!refresh) app.hidePreloader();
							// Update local storage data
							window.localStorage.setItem('stories', JSON.stringify(results));
							// PTR Done
							app.pullToRefreshDone();
							// reset .refresh-icon if necessary
							$$('.refresh-link.refresh-home').removeClass('refreshing');
							// Clear searchbar
							$$('.searchbar-input input')[0].value = '';
							// Update T7 data and render home page stories
							updateStories(results);
						}
					});
				});
			});
		}
		else {
			// Update T7 data and render home page stories
			updateStories(results);
		}
		return results;
	}
	
	// Update stories on PTR
	$$('.pull-to-refresh-content').on('refresh', function () {
      $$('.refresh-link.refresh-home').addClass('refreshing');
      getStories(true);
	});
	$$('.refresh-link.refresh-home').on('click', function () {
      var clicked = $$(this);
      if (clicked.hasClass('refreshing')) return;
      clicked.addClass('refreshing');
      getStories(true);
	});
	
	// Comments
	var allowCommentsInsert;
	app.onPageAfterAnimation('item', function (page) {
		allowCommentsInsert = true;
		var id = $$(page.container).attr('data-story-id');
		var comments = [];
		var story;
		for (var i = 0; i < app.template7Data.stories.length; i++) {
			if (app.template7Data.stories[i].id === parseInt(id, 10)) {
				story = app.template7Data.stories[i];
			}
		}
		var commentsCount = 0;
		if(story.kids) {
			story.kids.forEach(function (child) {
				hnapi.item(child, function(data) {
					var comment = JSON.parse(data);
					if (comment.text && comment.text.length && !comment.deleted) comments.push(comment);
					commentsCount ++;

					$$(page.container).find('.preloader-progress').text(Math.floor(commentsCount/story.kids.length*100));
					if (commentsCount === story.kids.length && allowCommentsInsert) {
						$$(page.container).find('.story-comments .messages').html(T7.templates.commentsTemplate(comments));
					}
				});
			});
		} else {
			$$(page.container).find('.story-comments .messages').html('<div class="preloader-label">No comment</div>');
		}
	});
	app.onPageBack('item', function () {
		allowCommentsInsert = false;
	});
	$$(document).on('click', '.message a', function (e) {
		window.open($$(this).attr('href'));
	});

	// Get and parse stories on app load
	getStories();
	
	// Export app to global
	window.app = app;
	
})(Framework7, Dom7, Template7, moment, hnapi);