module.exports = function(config){
  config.set({

    basePath : '../',

    files : [
      'www/bower_components/angular/angular.js',
      'www/bower_components/angular-route/angular-route.js',
      'www/bower_components/angular-mocks/angular-mocks.js',
      'www/bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
      'www/js/**/*.js',
      'www/partials/*.html',
      'test/mock/items.js',
      'test/mock/tools.js',
      'test/unit/**/*.js'
    ],

    autoWatch : true,

    frameworks: ['jasmine'],

    browsers : ['Firefox','Chrome'],

    plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-jasmine',
            'karma-junit-reporter',
            'karma-ng-html2js-preprocessor'
            ],


     // generate js files from html templates+    
     preprocessors: {
         'www/partials/*.html': ['ng-html2js']
     },
     
     ngHtml2JsPreprocessor: {
         stripPrefix: 'www/'
     },
     
    junitReporter : {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
