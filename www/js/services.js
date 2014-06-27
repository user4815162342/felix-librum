'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').
  value('name', 'Library').
  value('defaultPageLength',10).
  value('defaultSearchField','title').
  value('pageLengths',[10,25,50,100]).
  factory('queryParams',["$location",'defaultPageLength','defaultSearchField',function($location,defaultPageLength,defaultSearchField) {
  // The filter params are passed on through the URL, not cookies. I prefer not
  // to use cookies or session/localStorage, because 1) It caches usage data
  // which is unnecessary and not fair to the user and 2) it often causes
  // unexpected values to pop in when the user isn't expecting it: say it's
  // been six months since the last search, and these values pop in that
  // don't make any sense.
 
      return {
          filter: {
              field: function(value) {
                  if (value) {
                      if (value != this.field()) {
                          $location.search('ff',value || null);
                      }
                      return;
                  }
                  return $location.search().ff || defaultSearchField;
              },
              text: function(value) {
                  if (arguments.length > 0) {
                      if (value !== this.text()) {
                          $location.search('ft',value || null);
                      }
                      return;
                  }
                  return $location.search().ft;
              }
          },
          sort: function(value) {
              var sort = $location.search().sort;
              var result = {};
              if (arguments.length > 0) {
                  if (value) {
                      $location.search('sort',value);
                  } else {
                      $location.search('sort',null);
                  }
                  return;
              }
              if (sort) {
                  return sort;
              }
              return;
          },
          page: {
              length: function(value) {
                  if (value) {
                      if (value != this.length()) {
                          $location.search('pl',(value == defaultPageLength ? null : (value || null)));
                      }
                      return;
                  }
                  return $location.search().pl || defaultPageLength;
              },
              index: function(value) {
                  if (value) {
                      if (value != this.index()) {
                          $location.search('pi',(value == 1 ? null : (value || null)));
                      }
                      return;
                  }
                  return $location.search().pi || 1;
              }
          },
          urlParams: function() {
              return $location.url().slice($location.path().length + 1);
          },
          redirectToList: function() {
              $location.path("/list");
          }
              
      }
  }]);
