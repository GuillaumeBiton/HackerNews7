/*global Framework7, Dom7, Template7, routes */

(function (Framework7, $$, T7, routes) {
    'use strict';

    // Template7 helpers
    T7.registerHelper('pluralize', function (arr, options) {
        if (!arr) return '';
        if (typeof arr === "number") return (arr < 2) ? options.hash.single : options.hash.multiple;
        return (arr.length === 1) ? options.hash.single : arr.length + " " + options.hash.multiple;
    });

    var app, mainView;

    // Init App
    app = new Framework7({
        root: '#app', // App root element
        id: 'io.framework7.hackernews7', // App bundle ID
        name: 'HackerNews7', // App name
        theme: 'auto', // Automatic theme detection
        // Fix for iPhone X notch
        statusbar: {
            overlay: Framework7.device.ios ? Framework7.device.webView || Framework7.device.cordova : 'auto',
        },
        routes: routes, // App routes
    });

    // Add Right/Main View
    mainView = app.views.create('.view-main', {
        url: '/'
    });

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, routes));