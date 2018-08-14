routes = [{
    path: '/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var self = this;
      var app = self.app;

      // Get hnapi data
      if (app.data.api = JSON.parse(localStorage.getItem('hn7-api'))) {
        resolve({
          componentUrl: './pages/stories.html',
        })
      } else {
        app.request.json(app.data.apiUrl, function (data) {
          app.data.api = data;
          localStorage.setItem('hn7-api', JSON.stringify(data));
          resolve({
            componentUrl: './pages/stories.html',
          })
        })
      }
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