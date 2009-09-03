// TODO - merge the IPC code with the stuff in ApplicationServer
Conflagration.BrowserIPCController = Class.create({
  // XPCOM Component jank
  classDescription: "Conflagration Browser IPC Controller Component",
  classID:          Components.ID("071373d0-9829-11de-8a39-0800200c9a66"),
  contractID:       "@gironda.org/conflagration/browser-ipc-controller;1",
  QueryInterface:   XPCOMUtils.generateQI([Ci.nsIRunnable]),
  
  initialize: function(app, options) {
    this.app = app;
    this.options = options;
    this.wrappedJSObject = this;
    this._initFiles();
  },
  
  start: function() {
    // We start up in a new thread for ourself to run in.
    var backgroundThread = Cc["@mozilla.org/thread-manager;1"].getService().newThread(0);
    backgroundThread.dispatch(this, backgroundThread.DISPATCH_NORMAL);
  },
  
  // Implementation of nsIRunnable
  run: function() {
    while(true) { this._readStream(); };
  },
  
  _readStream: function() {
    var inputStream = Cc["@mozilla.org/network/file-input-stream;1"].createInstance(Ci.nsIFileInputStream);
    inputStream.init(this.inputFile, -1, -1, 0);

    var lineInputStream = inputStream.QueryInterface(Ci.nsILineInputStream);
    var line = {};
    do {
      var moreLines = lineInputStream.readLine(line);
      this._dispatchMessage(line.value);
    } while (moreLines);
  },
  
  _dispatchMessage: function(str) {
    try {
      var msg = JSON.parse(str);
      this['_handle' + msg.messageType + 'Message'](msg);
    } catch (e if e.name == "SyntaxError") {
      logger.fatal("Couldn't parse JSON message: " + str);
    } catch (e) {
      logger.fatal("Couldn't handle message: '" + str + "'. Exception: " + e.name + " - " + e.message);
    }
  },

  _initFiles: function() {
    this.outputFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    this.outputFile.initWithPath(this.options.outputPipe);
    this.inputFile = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    this.inputFile.initWithPath(this.options.inputPipe);
  },
  
  _handleSpawnServerMessage: function(msg) {
    var outputStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);
    outputStream.init(this.outputFile, -1, -1, null);
    try {
      this.app.spawnServer({gluePID: msg.gluePID, outputPipe: msg.inputPipe, inputPipe: msg.outputPipe});
      var outputMsg = JSON.stringify({messageType: 'ServerSpawned'}) + "\n";
      outputStream.write(outputMsg, outputMsg.length);
      outputStream.flush();
    } finally {
      outputStream.close();
    }
  }
  
});

// XPCOM Component jank.
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([Conflagration.BrowserIPCController]);
}