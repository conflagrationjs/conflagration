// TODO - have logging destinations other than stdout. Add log-level support too.
Conflagration.Logger = Class.create({
  debug: function(msg) {
    puts("[DEBUG] " + msg);
  },
  
  fatal: function(msg) {
    puts("[FATAL] " + msg);
  }
})