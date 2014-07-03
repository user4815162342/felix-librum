exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],
  
  // NOTE: I'm running into problems doing this parallel, so
  // instead I want to do this in series, and the only way I've found
  // to do this is to specify "--browser firefox", etc. at the command
  // line. This is done in the package.json file, however.
  /*multiCapabilities: [{
    'browserName': 'chrome'
  },{
    'browserName': 'firefox'
  }
  ],*/
  
  baseUrl: 'http://localhost:8000/www/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
