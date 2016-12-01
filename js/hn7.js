/*global Framework7, Dom7, Template7, moment, hnapi */

(function (Framework7, $$, T7, moment, hnapi) {
    'use strict';

    // Helpers
    T7.registerHelper('time_ago', function (time) {
        return moment.unix(time).fromNow();
    });
    T7.registerHelper('array_length', function (arr) {
        return arr ? arr.length : 0;
    });
    T7.registerHelper('pluralize', function (arr, options) {
        return (arr.length === 1) ? options.hash.single : arr.length + " " + options.hash.multiple;
    });
    T7.registerHelper('notEmpty', function (value) {
        return value || 0;
    });

    var app, mainView, leftView, splitView, allowCommentsInsert;

    // Init App
    app = new Framework7({
        modalTitle: 'HackerNews7',
        animateNavBackIcon: true,
        precompileTemplates: true,
        template7Pages: true,
        externalLinks: 'a.external, .message a',
        router: true
    });

    // Add Right/Main View
    mainView = app.addView('.view-main', {
        dynamicNavbar: true,
        animatePages: false,
        swipeBackPage: false,
        reloadPages: true,
        preloadPreviousPage: false
    });

    // Add Left View
    leftView = app.addView('.view-left', {
        dynamicNavbar: true
    });

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

    // Add active class for left view links and close panel
    $$(document).on('click', '.view-left .stories-list a.item-link', function (e) {
        $$('.stories-list a.item-link.active-story').removeClass('active-story');
        $$(this).addClass('active-story');
        if (splitView) {
            app.closePanel();
        }
    }, true);

    // Update data
    function updateStories(stories) {
        app.template7Data.stories = stories;
        $$('.page[data-page="index"] .page-content .list-block').html(T7.templates.storiesTemplate(stories));
    }
    // Fetch Stories
    function getStories(refresh) {
        var results = refresh ? [] : JSON.parse(window.localStorage.getItem('stories')) || [],
            storiesCount = 0;
        if (results.length === 0) {
            if (!refresh) {
                app.showPreloader('Loading top stories : <span class="preloader-progress">0</span> %');
            }
            hnapi.topStories(function (data) {
                data = JSON.parse(data);
                var limit = 100;
                data.splice(limit, data.length - limit);
                data.forEach(function (id, index) {
                    hnapi.item(id, function (data) {
                        data = JSON.parse(data);
                        if (data) {
                            data.domain = data.url ? data.url.split('/')[2] : '';
                        }
                        results[index] = data;
                        storiesCount += 1;
                        $$('.preloader-progress').text(Math.floor(storiesCount / limit * 100));
                        if (results.length === limit) {
                            if (!refresh) {
                                app.hidePreloader();
                            }
                            // Clear Empty Object in list
                            results = results.filter(function (n) {
                                return n !== null;
                            });
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
        } else {
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
        if (clicked.hasClass('refreshing')) {
            return;
        }
        clicked.addClass('refreshing');
        getStories(true);
    });

    // Comments
    function getComments(page) {
        allowCommentsInsert = true;
        var id = page.context.id,
            comments = [],
            story,
            commentsCount = 0,
            i;
        for (i = 0; i < app.template7Data.stories.length; i += 1) {
            if (app.template7Data.stories[i].id === parseInt(id, 10)) {
                story = app.template7Data.stories[i];
            }
        }
        if (story.kids) {
            story.kids.forEach(function (child, index) {
                hnapi.item(child, function (data) {
                    var comment = JSON.parse(data);
                    if (comment) {
                        if (comment.text && comment.text.length && !comment.deleted) {
                            comments[index] = comment;
                        }
                    }
                    commentsCount += 1;

                    $$(page.container).find('.preloader-progress').text(Math.floor(commentsCount / story.kids.length * 100));
                    if (commentsCount === story.kids.length && allowCommentsInsert) {
                        comments = comments.filter(function (n) {
                            return n !== undefined;
                        });
                        $$(page.container).find('.story-comments .messages').html(T7.templates.commentsTemplate(comments));
                    }
                }, function (err) {
                    commentsCount += 1;
                });
            });
        } else {
            $$(page.container).find('.story-comments .messages').html('<div class="preloader-label">No comments</div>');
        }
    }
    
    //user information
    function getUserInfo(page) {
        hnapi.user(page.context.by, function (data) {
            var user = JSON.parse(data);
            $$(".panel.panel-right").html(T7.templates.userTemplate(user));
        });
    }
    app.onPageInit('item', function (page) {
        if (page.view === mainView) {
            getComments(page);
        }
        getUserInfo(page);
    });
    app.onPageAfterAnimation('item', function (page) {
        if (page.view === leftView) {
            getComments(page);
        }
    });
    app.onPageBack('item', function () {
        allowCommentsInsert = false;
    });
    $$(document).on('click', '.message a', function (e) {
        e.preventDefault();
        window.open($$(this).attr('href'));
    });

    // Replies
    function getReplies(replies, element) {
        var comments = [],
            parent = $$(element).parent(),
            commentsCount = 0;
        parent.html('<div class="preloader"></div>');
        replies.forEach(function (reply, index) {
            hnapi.item(reply, function (data) {
                var comment = JSON.parse(data);
                if (comment.text && comment.text.length && !comment.deleted) {
                    comments[index] = comment;
                }
                commentsCount += 1;

                if (commentsCount === replies.length) {
                    comments = comments.filter(function (n) {
                        return n !== undefined;
                    });
                    parent.html(T7.templates.repliesTemplate(comments));
                }
            });
        });
    }
    $$(document).on('click', '.message-kids > a', function (e) {
        var replies = this.dataset.context.split(',');
        getReplies(replies, this);
    });

    // Search HN
    function updateOnSearch(results, limit) {
        if (results.length === limit) {
            // Reset search filter
            $$('.page[data-page="index"]').find('.searchbar-not-found').hide();
            $$('.page[data-page="index"]').find('.searchbar-not-found').html("Not Found");
            $$('.page[data-page="index"]').find('.searchbar-found').show();
            // Clear Empty Object in list
            results = results.filter(function (n) {
                return n !== null;
            });
            // reset .refresh-icon if necessary
            $$('.refresh-link.refresh-home').removeClass('refreshing');
            // Render page stories
            updateStories(results);
        }
    }
    $$('.page[data-page="index"] input[type="search"]').on('keyup', function (e) {
        if (e.keyCode === 13) {
            $$('.refresh-link.refresh-home').addClass('refreshing');
            $$('.page[data-page="index"]').find('.searchbar-not-found').html("Searching throw HN...");
            hnapi.search(this.value, function (data) {
                var results = [],
                    limit = 20;
                data = JSON.parse(data);
                data.hits.forEach(function (item, i) {
                    hnapi.item(item.objectID, function (data) {
                        data = JSON.parse(data);
                        if (data) {
                            data.domain = data.url ? data.url.split('/')[2] : '';
                        }
                        results[i] = data;
                        updateOnSearch(results, limit);
                    }, function (err) {
                        limit -= 1;
                        updateOnSearch(results, limit);
                    });
                });
            });
        }
    });
    $$('.page[data-page="index"] .searchbar-cancel').on('click', function () {
        updateStories(JSON.parse(window.localStorage.getItem('stories')) || []);
    });

    // Get and parse stories on app load
    getStories();

    // Export app to global
    window.app = app;

}(Framework7, Dom7, Template7, moment, hnapi));