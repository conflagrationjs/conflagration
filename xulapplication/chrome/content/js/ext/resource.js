Resource = Class.create({
  initialize: function(resourceURI) {
    this.resourceURI = resourceURI;
  },
  
  // This is retarded. I hate you so much sometimes, XPCOM.
  read: function(maxBytes) {
    var ioService = Cc['@mozilla.org/network/io-service;1'].getService(Ci.nsIIOService);
    var scriptableStream = Cc["@mozilla.org/scriptableinputstream;1"].getService(Ci.nsIScriptableInputStream);
    try {
      var stream = ioService.newChannel(this.resourceURI, null, null).open();
      scriptableStream.init(stream);
      return scriptableStream.read(maxBytes || stream.available());
    } finally {
      scriptableStream.close();
      stream.close();
    }
  }
});