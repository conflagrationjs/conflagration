Conflagration.ApplicationServer = Class.create({
  // XPCOM Component jank
  classDescription: "Conflagration Application Server Component",
  classID:          Components.ID("350c56a0-9845-11de-8a39-0800200c9a66"),
  contractID:       "@gironda.org/browser-application-server;1",
  QueryInterface:   XPCOMUtils.generateQI([Ci.nsIRunnable]),
  
  initialize: function(app, options) {

  },
  
  // Implementation of nsIRunnable
  run: function() {

  }
    
});

// XPCOM Component jank.
function NSGetModule(compMgr, fileSpec) {
  return XPCOMUtils.generateModule([Conflagration.ApplicationServer]);
}