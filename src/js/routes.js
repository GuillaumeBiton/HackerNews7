routes = [
    {
      path: '/',
      url: './index.html',
    },
    {
      path: '/about/',
      url: './pages/about.html',
    },
    {
      path: '/stories/',
      componentUrl: './pages/stories.html',
    },
    {
      path: '/storie/:id/',
      componentUrl: './pages/storie.html',
    },
    // Default route (404 page). MUST BE THE LAST
    {
      path: '(.*)',
      url: './pages/404.html',
    },
  ];
  