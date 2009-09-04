// FIXME - this dispatcher is shithouse.
// yep, still shit(e)house, months later
Conflagration.Dispatcher = Class.create({
  initialize: function(router) {
    this._router = router;
  },
  
  go: function(url) {
    logger.debug("Dispatching: " + url);
    var url = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService).newURI(url, null, null);
    url = url.QueryInterface(Ci.nsIURL);
    var path = url.filePath;
    var params = url.query.toQueryParams();
    var routeMatch = this._router.matchRoute(path, params);
    if (routeMatch) {
      return this._dispatch(path, routeMatch, params);
    } else {
      logger.debug("Oh god. I couldn't find a route for: " + path);
      throw({name: "RoutingError", message: "No route found for " + url});
    }
  },
  
  _dispatch: function(path, routeMatch, params) {
    var controller = this._getControllerInstance(path, routeMatch.controller);
    return controller.process(routeMatch.action, routeMatch.pathParts, params);
  },
  
  _getControllerInstance: function(newPath, controllerName) {
    var expectedController = controllerName.underscore() + "_controller"
    loadResource("user-application/app/controllers/" + expectedController);
    // TODO - Eventually these constructors might you know. Take arguments.
    // TODO - Eventually maybe make this not jammed on fucking window,
    //        or at least get a reference to 'mainWindow' from the application object. 
    return new window[controllerName + "Controller"];
  }
  
});