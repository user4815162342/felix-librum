'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('myApp.services', []).
  value('version', '0.1').
  value('name', 'Felix Librum').
  // TODO: Change the following to your library name.
  value('libraryName','Your Library').
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
  }]).
    factory('dataAccess',["$http",function($http) {
        return {
            getItems: function(onprogress,cb) {
                if (arguments.length === 1) {
                    cb = onprogress;
                    onprogress = function() {};
                }
                
                // onprogress is actually not available with http.get, but
                // i'm going to mimic it for now.
                var progress = 0;
                onprogress(progress);
                var timer = setInterval(function() {
                    if (progress < 99) {
                        progress += 2;
                        onprogress(progress);
                    } else {
                        clearInterval(timer);
                    }
                },250);
                
                // The parameter is added to make sure we don't reload cached
                // data after changes are made. 
                $http.get('data/items.json.gz?9').success(function(data) {
                    clearInterval(timer);
                    onprogress(100);
                    cb(null,data);
                }).error(function(data,status,headers,config) {
                    if (status === 404) {
                        // Just assume that no data has been uploaded yet,
                        // and return success, but with an empty array.
                        cb(null,[]);
                    } else {
                        cb(new Error("An error occurred retrieving the items (" + status + "). Please refresh to try again."));
                    }
                });
            },
            
            getItem: function(id,cb) {
                $http.get('data/' + id + '.json').success(function(data) {
                    cb(null,data);
                }).error(function(data,status,headers,config) {
                    cb(new Error("An error occurred retrieving item " + id + " (" + status + "). Please refresh to try again."));
                });
            }
        }
    }]);
