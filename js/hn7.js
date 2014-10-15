(function (Framework7, $$, T7, moment, hnapi) {
	'use strict';

	T7.registerHelper('time_ago', function (time) {
		return moment.unix(time).fromNow();
	});
	
	var app = new Framework7({
		modalTitle: 'HackerNews7',
		
		animateNavBackIcon: true,
		
		precompileTemplates: true,
		template7Pages: true
	});
	
	var mainView = app.addView('.view-main', {
		dynamicNavbar: true
	});
	
	var stories = function () {
		var results = JSON.parse(window.localStorage.getItem('stories')) || [];
		if (results.length === 0) {		
			hnapi.topStories(function (data) {
				data = JSON.parse(data);
				data.forEach(function(id) {
					hnapi.item(id, function(data) {
						data = JSON.parse(data);
						data.domain = data.url.split('/')[2];
						results.push(data);
					});
				});
			});
		}
		return results;
	};
	
	var comments = function(id) {
		var comments = [];
	};
		
	$$(document).on('ajaxStart', function () {
		if(typeof app.template7Data.stories === 'undefined') {
			app.showIndicator();
		}
	});
	
	$$(document).on('ajaxComplete', function () {
		if(typeof app.template7Data.stories !== 'undefined' && app.template7Data.stories.length === 100) {
			window.localStorage.setItem('stories', JSON.stringify(app.template7Data.stories));
			app.hideIndicator();
			$$('.page[data-page="index"] .page-content .list-block').html(T7.templates.storiesTemplate(app.template7Data.stories));
			app.pullToRefreshDone();
		}
	});
	
	$$('.pull-to-refresh-content').on('refresh', function () {
		window.localStorage.removeItem('stories');
		app.template7Data.stories = stories();
	});

	// Comments
	app.onPageAfterAnimation('item', function (page) {
		var id = $$(page.container).attr('data-story-id');
		var comments = [];
		var story;
		for (var i = 0; i < app.template7Data.stories.length; i++) {
			if (app.template7Data.stories[i].id === parseInt(id, 10)) {
				story = app.template7Data.stories[i];
			}
		}
		var commentsCount = 0;
		story.kids.forEach(function (child) {
			hnapi.item(child, function(data) {
				var comment = JSON.parse(data);
				if (comment.text && comment.text.length && !comment.deleted) comments.push(comment);
				commentsCount ++;
				if (commentsCount === story.kids.length) {
					$$(page.container).find('.story-comments .messages').html(T7.templates.commentsTemplate(comments));
				}
			});
		});
	});
	$$(document).on('click', '.message a', function (e) {
		window.open($$(this).attr('href'));
	});
	
	app.template7Data.stories = stories();
	$$('.page-content .list-block').html(T7.templates.storiesTemplate(app.template7Data.stories));
	
	window.app = app;
	
})(Framework7, Dom7, Template7, moment, hnapi);