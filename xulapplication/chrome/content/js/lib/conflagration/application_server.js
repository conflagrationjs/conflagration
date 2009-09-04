loadResource("js/lib/conflagration/router");
loadResource("js/lib/conflagration/dispatcher");

// TODO - merge the IPC code with the stuff in BrowserIPCController
Conflagration.ApplicationServer = Class.create({
  // XPCOM Component jank
  classDescription: "Conflagration Application Server Component",
  classID:          Components.ID("350c56a0-9845-11de-8a39-0800200c9a66"),
  contractID:       "@gironda.org/conflagration/application-server;1",
  QueryInterface:   XPCOMUtils.generateQI([Ci.nsIRunnable]),
  
  initialize: function(app, options) {
    this.app = app;
    this.options = options;
    this.wrappedJSObject = this;
    this._initFiles();
    this.router = Conflagration.Router.initializeFromApplication(app);
    this.dispatcher = new Conflagration.Dispatcher(this.router);
  },
  
  // Implementation of nsIRunnable
  run: function() {
    logger.debug("Running ApplicationServer thread for glue PID " + this.options.gluePID);
    try {
      while(true) { this._handleRequests(); };
    } catch (e if e.name == "StopListening") {
      logger.debug("ApplicationServer " + this.options.gluePID + " is no longer listening for requests.");
    };
  },
  
  start: function() {
    // We start up in a new thread for ourself to run in.
    this.backgroundThread = Cc["@mozilla.org/thread-manager;1"].getService().newThread(0);
    this.backgroundThread.dispatch(this, this.backgroundThread.DISPATCH_NORMAL);
  },
  
  shutdown: function() {
    this.backgroundThread.shutdown();
  },
  
  _initFiles: function() {
    this.outputFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    this.outputFile.initWithPath(this.options.outputPipe);
    this.inputFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    this.inputFile.initWithPath(this.options.inputPipe);
  },
  
  _handleRequests: function() {
    var inputStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    logger.debug("Opening input stream for: " + this.inputFile.path);
    inputStream.init(this.inputFile, -1, -1, 0);

    var lineInputStream = inputStream.QueryInterface(Ci.nsILineInputStream);
    var line = {};
    do {
      var moreLines = lineInputStream.readLine(line);
      this._handleMessage(line.value);
    } while (moreLines);
  },
  
  _handleMessage: function(msg) {
    logger.debug("Handling: " + msg);
    var jsonMsg = JSON.parse(msg);
    this['_handle' + jsonMsg.messageType + 'Message'](jsonMsg);
  },
  
  _handleStopListeningMessage: function(msg) {
    var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    outputStream.init(this.outputFile, -1, -1, null);
    try {
      var outputMsg = JSON.stringify({messageType: "ListeningStopped"}) + "\n";
      outputStream.write(outputMsg, outputMsg.length);
      outputStream.flush();
    } finally {
      outputStream.close();
    }
    // TODO - ugh. Basically using exceptions as flow control. Let's not do this for-realsies
    throw({name: "StopListening", message: "Server listening cancellation requested."});
  },
  
  _handleRequestMessage: function(msg) {
    this._dispatchResponse(msg);
  },
  
  _dispatchResponse: function(msg) {
    var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    outputStream.init(this.outputFile, -1, -1, null);
    try {
      var rackEnv = msg.rackEnv;
      // FIXME - this is ballsacks, but for now until we have a real request object and all that jazz we just
      // reconstruct the URI and hand it off to the ghetto-dispatcher
      var requestURI = rackEnv['rack.url_scheme'] + "://" + rackEnv['HTTP_HOST'] + rackEnv['REQUEST_URI'];
      var responseBody = this.dispatcher.go(requestURI);
      var outputMsg = JSON.stringify({messageType: 'response', status: 200, headers: {}, body: responseBody}) + "\n";
      outputStream.write(outputMsg, outputMsg.length);
      outputStream.flush();
    } finally {
      outputStream.close();
    }
  }
  
});

// XPCOM Component jank.
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([Conflagration.ApplicationServer]);
}