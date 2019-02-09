
import AboutPage from '../pages/about.f7.html';

import NotFoundPage from '../pages/404.f7.html';

import StoriesPage from '../pages/stories.f7.html';
import StoryPage from '../pages/story.f7.html';

var routes = [
  {
    path: '/',
    async: function (routeTo, routeFrom, resolve, reject) {
      var self = this;
      var app = self.app;

      // Get hnapi data
      if (app.data.api = JSON.parse(localStorage.getItem('hn7-api'))) {
        resolve({
          component: StoriesPage,
        })
      } else {
        app.request.json(app.data.apiUrl, function (data) {
          app.data.api = data;
          localStorage.setItem('hn7-api', JSON.stringify(data));
          resolve({
            component: StoriesPage,
          })
        })
      }
    },
    master: true,
    detailRoutes : [
      {
        path: '/story/:id/',
        component: StoryPage,
      },
    ]
  },
  {
    path: '/about/',
    component: AboutPage,
  },
  {
    path: '/story/:id/',
    component: StoryPage,
  },
  {
    path: '(.*)',
    component: NotFoundPage,
  },
];

export default routes;