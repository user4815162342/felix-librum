exports.config = {
  allScriptsTimeout: 11000,

  specs: [
    'e2e/*.js'
  ],
  
  /*multiCapabilities: [{
    'browserName': 'chrome'
  },{
    'browserName': 'firefox'
  }
  ],*/
  
  capabilities: {
      'browserName': 'firefox'
  },

  baseUrl: 'http://localhost:8000/www/',

  framework: 'jasmine',

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  }
};
