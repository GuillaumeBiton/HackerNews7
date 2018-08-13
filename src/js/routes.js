routes = [
    {
      path: '/',
      async: function (routeTo, routeFrom, resolve, reject) {
        var self = this;
        var app = self.app;

        // Get hnapi data
        app.request.json(app.data.apiUrl, function (data) {
          app.data.api = data;
          resolve({
            componentUrl: './pages/stories.html',
          })
        })
      }
    },
    {
      path: '/empty/',
      url: './pages/empty.html',
    },
    {
      path: '/about/',
      url: './pages/about.html',
    },
    {
      path: '/story/:id/',
      componentUrl: './pages/story.html',
    },
    // Default route (404 page). MUST BE THE LAST
    {
      path: '(.*)',
      url: './pages/404.html',
    },
  ];
  