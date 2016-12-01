/*global Framework7, Dom7 */

(function (Framework7, $$) {
	'use strict';

	var urls = [
		'https://hacker-news.firebaseio.com/v0/'
	], req, hnapi;

	req = function (path, success, error, retry) {
		retry = retry || 0;
		return $$.ajax({
			url: urls[retry % urls.length] + path,
			success: success,
			error: function (xhr) {
				if (retry < urls.length - 1) {
					req(path, success, error, retry += 1);
				} else {
					error(xhr);
				}
			}
		});
	};

	hnapi = {

		urls: urls,

		item: function (id, success, error) {
			return req('item/' + id + '.json', success, error);
		},

		user: function (user, success, error) {
			return req('user/' + user + '.json', success, error);
		},

		topStories: function (success, error) {
			return req('topstories.json', success, error);
		},

		maxItemID: function (success, error) {
			return req('maxitem.json', success, error);
		},

		updates: function (success, error) {
			return req('updates.json', success, error);
		},
		
		search: function (query, success, error) {
			var url = (typeof query === "string") ? "http://hn.algolia.com/api/v1/search?query=" +  encodeURIComponent(query) + "&tags=story" : null;
			return $$.ajax({
				url: url,
				success: success,
				error: error
			});
		}
	};

	window.hnapi = hnapi;

}(Framework7, Dom7));