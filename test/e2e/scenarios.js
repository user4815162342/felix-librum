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

  // This is missing functionality in protractor, as far as I'm concerned.
  // A way to sleep so you can see what's going on.  
  var sleep = function(ms) {
     var doneSleeping = false;
     browser.wait(function() {
         return doneSleeping;
     },ms + 100,"This was an intentional pause, don't worry that it timed out.");
     setTimeout(function() {
         doneSleeping = true;
     },ms);
     
  }

  browser.addMockModule('myApp.services',mockScript);
  browser.get('index.html');

  it('should automatically redirect to /list when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/list");
  });

  // TODO: Should put some user interface scenarios in here.
  describe('browsing the data', function() {
    // should already be on list, so I don't want a beforeEach that goes
    // back to the beginning.

    it('should render itemsController when user navigates to /list', function() {
      expect(element.all(by.css('[ng-view] div')).first().getText()).
        toMatch(/The library has .* items in its catalog/);
        // also make sure it's rendering content.
      expect(element.all(by.css('tbody tr')).count()).toBe(10);
    });
    
    it('should initiate a search when values are changed in the search fields', function() {
        // search field right now should be 'title'.
        element(by.id("searchText")).sendKeys("galaxy\n");
        expect(element(by.id("status")).getText()).toMatch("2 items match your query.");
        element(by.id("searchText")).clear();
        element(by.id("searchText")).sendKeys("Oolon\t");
        expect(element(by.id("status")).getText()).toMatch("No items match your query.");
        element(by.id("search-field")).click();
        element.all(by.css("#search-field-choice ul li a")).get(1).click();
        expect(element(by.id("status")).getText()).toMatch("7 items match your query.");
    });
    
    it('should allow the user to page through the results', function() {
        browser.get("index.html#/list");
        element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(val) {
            // Now, click on the page 2.
            element.all(by.css('#paginator ul li a')).get(3).click();
            expect(element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText()).not.toEqual(val);
        });
    });
    
    it('should allow the user to change the page length', function() {
        browser.get("index.html#/list");
        element(by.id("page-length")).click();
        element.all(by.css("#page-length-choice ul li a")).get(1).click();
        // page size should be 25, but we only have 23 records in our data.
        expect(element.all(by.css('tbody tr')).count()).toBe(23);
        // paginator should now be invisible.
        expect(element(by.css("#paginator ul")).isDisplayed()).toBe(false);
        
    });
    
    it("should change to a valid page if the search results shrink and we're on the last page", function() {
        browser.get("index.html#/list");
        element.all(by.css('#paginator ul li a')).get(4).click();
        element.all(by.css('#paginator ul li')).get(4).getAttribute("class").then(function(val) {
            // page should be active now.
            expect(val.split(" ")).toContain("active");
            // now, change the search.
            element(by.id("searchText")).sendKeys("g\n");
            element.all(by.css('#paginator ul li')).get(3).getAttribute("class").then(function(val) {
                // second page should be active now.
                expect(val.split(" ")).toContain("active");
            });
        });
    });
    
    it("should sort the items when column headers are clicked", function() {
        browser.get("index.html#/list");
        element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(unsortedVal) {
            element.all(by.css("thead tr th")).get(0).click();
            element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(sortedAscVal) {
                expect(sortedAscVal).not.toEqual(unsortedVal);
                element.all(by.css("thead tr th")).get(0).click();
                element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(sortedDescVal) {
                    expect(sortedDescVal).not.toEqual(sortedAscVal);
                    expect(sortedDescVal).not.toEqual(unsortedVal);
                    element.all(by.css("thead tr th")).get(0).click();
                    expect(element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText()).toEqual(unsortedVal);
                });
            });
        });
    });
    
    it("should display a detail page for titles, with links back to the results", function() {
        // Since our detail only contains item 20, let's go to that page. That way,
        // if I ever change that, this test will still work.
        browser.get("index.html#/list?pi=2");
        element.all(by.css('tbody tr td a')).get(9).then(function(item) {
            item.getText().then(function(title) {
                item.click();
                // expect that we went to the right page.
                expect(element.all(by.css('#title cite')).get(0).getText()).toEqual(title);
                element(by.id("results")).click();
                // should be back on the previoius page again.
                expect(element.all(by.css('tbody tr td a')).get(9).getText()).toEqual(title);
                // Now, go back to details again.
                element.all(by.css('tbody tr td a')).get(9).click();
                // try writing a search again. This should take us back to the
                // results with a different page.
                element(by.id("searchText")).sendKeys("galaxy\n");
                expect(element(by.id("status")).getText()).toMatch("2 items match your query.");
                // now, go back to the details. 
                // since navigate().back() doesn't retain our mocked data module,
                // (Let's just cheat and just put the URL back in).
                browser.get("index.html#/detail/20?pi=2");
                // now, try one of the author links.
                element.all(by.css("#authors a")).get(0).click();
                // and we should have seven books by this guy, because this
                // is the same as doing an Author search for 'Oolon', as above.
                expect(element(by.id("status")).getText()).toMatch("7 items match your query.");
                
            });
        });
        
    });
    
    // The mock module doesn't work with the navigation, so we'll just have
    // to go with the actual data, just *don't* hardcode value expectations.
    it("should change the view when the URL is changed and navigating backwards.",function() {
        browser.removeMockModule('myApp.services',mockScript);
        browser.get("index.html#/list");
        element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(unsortedVal) {
            browser.get("index.html#/list?sort=+title");
            element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText().then(function(sortedVal) {
                expect(sortedVal).not.toEqual(unsortedVal);
                browser.navigate().back();
                expect(element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText()).toEqual(unsortedVal);
                browser.navigate().forward();
                expect(element(by.css('tbody tr')).element(by.css('td')).element(by.css('a')).getText()).toEqual(sortedVal);
            })
        });
        
    });
    
  });


});
