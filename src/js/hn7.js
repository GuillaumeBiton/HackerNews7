/*global Framework7, Dom7, Template7, routes */

(function (Framework7, $$, T7, routes) {
    'use strict';

    var app, mainView;

    // Init App
    app = new Framework7({
        root: '#app', // App root element
        id: 'io.framework7.hackernews7', // App bundle ID
        name: 'HackerNews7', // App name
        theme: 'auto', // Automatic theme detection
        routes: routes, // App routes
    });

    // Add Right/Main View
    mainView = app.views.create('.view-main', {
        url: '/'
    });

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, routes));