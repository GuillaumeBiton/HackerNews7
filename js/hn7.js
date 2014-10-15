(function (Framework7, $$, T7, moment, hnapi) {
	'use strict';
	
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
						data['timeAgo'] = moment.unix(data.time).fromNow();
						data['domain'] = data.url.split('/')[2];
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
		if(typeof app.template7Data.comments !== 'undefined' && app.template7Data.comments.length > 0) {
			$$('#comments').html(T7.templates.commentsTemplate(app.template7Data.comments));
		}
	});
	
	$$('.pull-to-refresh-content').on('refresh', function () {
		window.localStorage.removeItem('stories');
		app.template7Data['stories'] = stories();
	});
	
	app.onPageInit('item', function (page) {
		var id = $$(page.container).attr('data-story-id');
		var comments = [];
		var comments = function() {
			var results = [];
			hnapi.item(id, function (story) {
				JSON.parse(story).kids.forEach(function (child) {
					hnapi.item(child, function(data) {
						results.push(JSON.parse(data));
					});
				});
			});
			return results;
		};
		app.template7Data['comments'] = comments();
	});
	
	app.template7Data['stories'] = stories();
	$$('.page-content .list-block').html(T7.templates.storiesTemplate(app.template7Data.stories));
	
	window.app = app;
	
})(Framework7, Dom7, Template7, moment, hnapi);