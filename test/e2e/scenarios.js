'use strict';

/* https://github.com/angular/protractor/blob/master/docs/getting-started.md */

describe('my app', function() {

  // need some mock data in the application. This appears to
  // be the easiest way to do this. It required me to move the
  // dataAccess into a separate service, but that's probably a good
  // thing anyway.
  var mock = require("../mock/items");
  var mockScript = "angular.module('myApp.services').factory('dataAccess',['$timeout',function($timeout) { \
       return {\
            getItems: function(cb) { \
                $timeout(function() {\
                    cb(null," + JSON.stringify(mock.items) + "); \
                },1000);\
            },\
            \
            getItem: function(id,cb) {\
                $timeout(function() {\
                    cb(null," + JSON.stringify(mock.item20) + "); \
                },1000);\
            }\
       } \
  }])";

  browser.addMockModule('myApp.services',mockScript);
  browser.get('index.html');

  it('should automatically redirect to /list when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/list");
  });

  // TODO: Should put some user interface scenarios in here.
  describe('list', function() {

    beforeEach(function() {
      browser.get('index.html#/list');
    });


    it('should render itemsController when user navigates to /list', function() {
      expect(element.all(by.css('[ng-view] div')).first().getText()).
        toMatch(/The library has .* items in its catalog/);
    });

  });


  describe('details', function() {

    beforeEach(function() {
      browser.get('index.html#/detail/1');
    });


    it('should render itemsDetail when user navigates to /detail', function() {
      expect(element.all(by.css('[ng-view] div')).first().getText()).
        toMatch(/Back to Results/);
    });

  });
});
