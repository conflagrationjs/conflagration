var inputPipe = Cc["@mozilla.org/process/environment;1"].getService(Ci.nsIEnvironment).get('controller_input_pipe');
alert(inputPipe);