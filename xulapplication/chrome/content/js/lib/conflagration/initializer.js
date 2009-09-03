loadResource("js/lib/conflagration/logger")

Conflagration.Initializer = Class.create({
  motdURL: "resource://root/motd.txt",
  
  initialize: function(app) {
    this.app = app;
  },
  
  go: function() {
    this._displayMOTD();
    this._initializeLogging();
    this._setFocus();
    this.app.initializationDone();
  },
  
  _displayMOTD: function() {
    // This is retarded. I hate you so much sometimes, XPCOM.
    var ios = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
    var stream = ios.newChannel(this.motdURL, null, null).open();
    var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].getService(Ci.nsIScriptableInputStream);
    scriptableStream.init(stream);
    var str = scriptableStream.read(stream.available());
    scriptableStream.close();
    stream.close();
    print(str.interpolate({version: this.app.conflagrationInfo.version}));
  },
  
  _setFocus: function() {
    this.app.mainWindow.focus();
  },
  
  _initializeLogging: function() {
    var consoleService = Cc["@mozilla.org/consoleservice;1"].getService(Ci.nsIConsoleService);
    this.app.mainWindow.logger = new Conflagration.Logger();
    // TODO - this is shitty but just gives us some rudimentary console logging for now.
    var consoleListener = {observe: function(consoleMessage) { logger.debug(consoleMessage.message); }};
    consoleService.registerListener(consoleListener);
  }
  
});