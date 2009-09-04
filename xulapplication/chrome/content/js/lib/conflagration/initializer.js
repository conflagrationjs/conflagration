loadResource("js/lib/conflagration/logger")
loadResource("js/ext/resource")

Conflagration.Initializer = Class.create({
  motdURL: "resource://root/motd.txt",
  
  initialize: function(app) {
    this.app = app;
  },
  
  go: function() {
    this._displayMOTD();
    this._initializeLogging();
    this._setFocus();
    this._setupResourceHandler();
    this.app.initializationDone();
  },
  
  _displayMOTD: function() {
    var motd = (new Resource(this.motdURL)).read();
    print(motd.interpolate({version: this.app.conflagrationInfo.version}));
  },
  
  _setFocus: function() {
    this.app.mainWindow.focus();
  },
  
  _initializeLogging: function() {
    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    this.app.mainWindow.logger = new Conflagration.Logger();
    // TODO - this is shitty but just gives us some rudimentary console logging for now.
    var consoleListener = {observe: function(consoleMessage) { logger.debug("[JSCONSOLE] " + consoleMessage.message); }};
    consoleService.registerListener(consoleListener);
  },
  
  _setupResourceHandler: function() {
    var ioService = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
    var resProt = ioService.getProtocolHandler("resource").QueryInterface(Ci.nsIResProtocolHandler);

    var aliasFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    aliasFile.initWithPath(this.app.options.application_root);
    var aliasURI = ioService.newFileURI(aliasFile);
    resProt.setSubstitution("user-application", aliasURI);
  }
  
});