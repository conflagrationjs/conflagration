(function(globalScope){
  // Global Cc and Ci variables to ease dealing with XPCOM
  globalScope.Cc = Components.classes;
  globalScope.Ci = Components.interfaces;
  
  // Global 'load' function to ease loading non-JSM code like Prototype
  var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
  globalScope.load = function(uri, moduleScope) {
    return loader.loadSubScript(uri, moduleScope);
  }
  
  load('resource://js/lib/conflagration.js');
  Conflagration.boot();
  
})(this);