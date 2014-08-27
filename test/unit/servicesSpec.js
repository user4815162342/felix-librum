'use strict';

/* jasmine specs for services go here */

describe('service', function() {
  beforeEach(module('felixLibrum.services'));
  // Need this to mock $location.
  beforeEach(module('felixLibrum.mock.tools'));
   


  describe('version', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
  
  describe('queryParams', function() {
      // $location required by queryParams is supposed to go against a 
      // mock browser instance, but there's no documentation on how
      // to use it, and attempting to follow what other's have done
      // showed some undefined methods that $location was expecting.
      // I'm probably just doing it wrong.
      
      it('should get the queryParams object', inject(function(queryParams,defaultSearchField,defaultPageLength) {
          expect(queryParams).toBeDefined();
          expect(queryParams.filter.field()).toEqual(defaultSearchField);
          expect(queryParams.filter.text()).toBeUndefined();
          expect(queryParams.sort()).toBeUndefined();
          expect(queryParams.page.length()).toEqual(defaultPageLength);
          expect(queryParams.page.index()).toEqual(1);
      }));
      
      it('should allow read/write access to the various query parameters', inject(function(queryParams) {
          // changing values should store those states.
          queryParams.filter.field('all');
          expect(queryParams.filter.field()).toEqual('all');
          queryParams.filter.field('subtitle');
          expect(queryParams.filter.field()).toEqual('subtitle');
          
          
          queryParams.filter.text('foo');
          expect(queryParams.filter.text()).toEqual('foo');
          
          queryParams.sort('+title');
          expect(queryParams.sort()).toEqual('+title');
          
          queryParams.page.length(42);
          expect(queryParams.page.length()).toEqual(42);
          
          queryParams.page.index(108);
          expect(queryParams.page.index()).toEqual(108);
      }));
      
      it('should handle some other methods.',inject(function($location,queryParams) {
          expect(queryParams.urlParams()).toEqual("ff=subtitle&ft=foo&sort=+title&pl=42&pi=108");
          
          // check redirecting.
          // NOTE: These only work because of our location mock.
          $location.path("/detail/23");
          expect($location.__path).toEqual("/detail/23");
          queryParams.redirectToList();
          expect($location.__path).toEqual("/list");
          
      }));
  });
});

