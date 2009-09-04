Conflagration.Router = Class.create({
  initialize: function() {
    this._routeSet = $A();
  },
  
  connect: function(uriMatcher, options) {
    this._routeSet.push(new Conflagration.Router.Route(uriMatcher, options));
  },
  
  matchRoute: function(path, queryParams) {
    var routePathParts = null;
    var foundRoute = this._routeSet.detect(function(route){
      if (routePathParts = route.match(path, queryParams)) {
        return true;
      }
    });
    
    if (foundRoute) {
      return {pathParts: routePathParts, controller: foundRoute.controller, action: foundRoute.action};
    } else {
      return null;
    }
  },
});

Object.extend(Conflagration.Router, {
  initializeFromApplication: function(application) {
    var sandbox = Cu.Sandbox(application.mainWindow);
    var applicationRoutes = (new Resource("resource://user-application/config/routes.js")).read();
    var router = new this;
    sandbox.map = router;
    Cu.evalInSandbox(applicationRoutes, sandbox);
    logger.debug("Routes set up for:\n\n" + router._routeSet.inspect());
    return router;
  }
});
  

Conflagration.Router.Route = Class.create({
  initialize: function(uriMatcher, options) {
    this._matcher = new RegExp('^' + uriMatcher + '$');
    this._options = options;
    this.controller = this._options.controller;
    this.action = this._options.action;
  },
  
  match: function(path, queryParams) {
    var parts = this._matcher.exec(path);
    if (parts) {
      parts.shift();
      return parts;
    } else {
      return false;
    }
  },
  
  inspect: function() {
    return $H({matcher: this._matcher, controller: this.controller, action: this.action}).inspect();
  }
});
