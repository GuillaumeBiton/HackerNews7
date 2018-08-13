/*global Framework7, Dom7, Template7, routes */

(function (Framework7, $$, T7, routes) {
    'use strict';

    // Template7 helpers
    T7.registerHelper('pluralize', function (arr, options) {
        if (!arr) return '';
        if (typeof arr === "number") return (arr < 2) ? options.hash.single : options.hash.multiple;
        return (arr.length === 1) ? options.hash.single : arr.length + " " + options.hash.multiple;
    });
    // Template 7 Register partial
    T7.registerPartial(
        'comments',
        '{{#each comments}}' +
            '<div class="message message-first message-last message-tail{{#js_if "@index%2 === 0"}} message-sent{{else}} message-received{{/js_if}}">' +
                '<div class="message-content">' +
                    '<div class="message-name">{{user}}, {{time_ago}}</div>' +
                    '<div class="message-bubble">' +
                        '<div class="message-text">{{content}}</div>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            '{{#if comments}}{{> "comments"}}{{/if}}' +
        '{{/each}}'
    );

    var app, mainView, leftView, splitView;

    // Init App
    app = new Framework7({
        root: '#app', // App root element
        id: 'io.framework7.hackernews7', // App bundle ID
        name: 'HackerNews7', // App name
        theme: 'auto', // Automatic theme detection
        clicks: {
            externalLinks: '.external, .message a', //external links also in comments
        },
        routes: routes, // App routes
        data() {
            return {
                apiUrl: "https://api.hnpwa.com/v0/",
                api: null
            }
        },
        methods: {
            fetchAPI() {
                var self = this;
                self.request.json(self.data.apiUrl, (api) => {
                    self.data.api = api
                })
            }
        },
        // Enable panel left visibility breakpoint
        panel: {
            leftBreakpoint: 960,
        },
    });

    
    // Add Right/Main View
    mainView = app.views.create('.view-main', {
        url: '/'
    });

    // Add Right/Main View
    leftView = app.views.create('.view-left', {
        url: '/'
    });

    // Modify layout on splitview
    function checkSplitView() {
        var activeStoryLink;
        if ($$(window).width() < 767) {
            delete leftView.params.linksView;
            if (splitView) {
                // Need to check main view history and load same page into left view
                activeStoryLink = $$('.stories-list a.item-link.active-story');
                if (mainView.history.length > 1 && activeStoryLink.length > 0) {
                    leftView.router.load({
                        animatePages: false,
                        url: activeStoryLink.attr('href'),
                        contextName: activeStoryLink.attr('data-contextName')
                    });
                }
            }
            splitView = false;
        } else {
            if (!splitView) {
                // Need to check left view history and go back
                if (leftView.history.length === 2) {
                    leftView.router.back({
                        animatePages: false
                    });
                    activeStoryLink = $$('.stories-list a.item-link.active-story');
                    // Need to load same page in main view on the right
                    mainView.router.load({
                        url: activeStoryLink.attr('href'),
                        contextName: activeStoryLink.attr('data-contextName')
                    });
                }
            }
            splitView = true;
            leftView.params.linksView = '.view-main';
        }
    }
    $$(window).resize(checkSplitView);
    checkSplitView();

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, routes));