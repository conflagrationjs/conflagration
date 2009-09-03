var Conflagration = {
  bootEnvVars: ['xul_application', 'application_name', 'application_root', 'headless', 'environment',
                'controller_input_pipe', 'controller_output_pipe'],
  
  boot: function(mainWindow) {
    this._initializeHelpers(mainWindow);
    this._loadBasicDependencies();
    
    var options = this._extractEnvironmentVariablesAsOptions();
    this._initialize(mainWindow, options);
  },
  
  _initializeHelpers: function(mainWindow) {
    mainWindow.Cc = Components.classes;
    mainWindow.Ci = Components.interfaces;
    
    // Global 'load' function to ease loading non-JSM code like Prototype
    var loader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader); 
    mainWindow.load = function(uri, moduleScope) {
      return loader.loadSubScript(uri, moduleScope);
    };
    
    //Shortcut for loading resources
    mainWindow.loadResource = function(path, moduleScope) {
      load('resource://' + encodeURI(path) + ".js", moduleScope);
    };
    
    mainWindow.print = mainWindow.dump;
    mainWindow.puts = function(str) { mainWindow.print(str + "\n"); };
  },
  
  _loadBasicDependencies: function() {
    loadResource("vendor/prototype");
    // Loads this via Components.utils.import as it's a JSM file.
    Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
  },
  
  _extractEnvironmentVariablesAsOptions: function() {
    var env = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment);
    return $A(this.bootEnvVars).inject({}, function(options, key) {
      options[key] = env.get(key);
      return options;
    });
  },
  
  _initialize: function(mainWindow, options) {
    loadResource("js/lib/conflagration/runner_application");
    mainWindow.application = new Conflagration.RunnerApplication(mainWindow, options);
    mainWindow.application.start();
  }
  
};