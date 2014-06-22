'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').
  value('name', 'Library').
  factory('queryParams',["$location",function($location) {
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
                  return $location.search().ff || "title";
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
              var search = $location.search();
              var result = {};
              if (value) {
                  for (var key in value) {
                      if (value.hasOwnProperty(key)) {
                          result.sf = key;
                          result.sd = value[key];
                          break;
                      }
                  }
                  if (result.sf != search.sf) {
                      $location.search('sf',result.sf || null);
                  }
                  if (result.sd != search.sd) {
                      $location.search('sd',result.sd || null);
                  }
                  return;
              }
              var result = {};
              if (search.sf) {
                  result[search.sf] = search.sd;
              }
          },
          page: {
              length: function(value) {
                  if (value) {
                      if (value != this.length()) {
                          $location.search('pl',(value == 10 ? null : (value || null)));
                      }
                      return;
                  }
                  return $location.search().pl || 10;
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
