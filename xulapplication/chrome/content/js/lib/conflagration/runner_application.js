loadResource("js/lib/conflagration/browser_ipc_controller");
loadResource("js/lib/conflagration/application_server");

Conflagration.RunnerApplication = Class.create({
  initialize: function(mainWindow, options) {
    this.mainWindow = mainWindow;
    this.options = options;
    this.conflagrationInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
    this._defineGetters();
  },
  
  start: function() {
    loadResource("js/lib/conflagration/initializer");
    var initializer = new Conflagration.Initializer(this);
    initializer.go();
  },
  
  // Callback when initialization from the Initializer is finished.
  // We're all done with initialization, so let's listen for IPC commands
  initializationDone: function() {
    this._initializeBrowserIPCController();
  },
  
  spawnServer: function(options) {
    logger.debug("Spawning a new server for: " + $H(options).inspect());
  },
  
  
  _defineGetters: function() {
    var envChecker = function(envName) { return this.environment == envName; };
    this.__defineGetter__("environment", function() { return this.options.environment });
    this.__defineGetter__("development", envChecker.curry("development"));
    this.__defineGetter__("test", envChecker.curry("test"));
    this.__defineGetter__("production", envChecker.curry("production"));
  },
  
  _initializeBrowserIPCController: function() {
    this.browserIPCController = new Conflagration.BrowserIPCController(this, {outputPipe: this.options.controller_input_pipe, 
                                                                              inputPipe: this.options.controller_output_pipe});
    this.browserIPCController.initiate();
  }
});