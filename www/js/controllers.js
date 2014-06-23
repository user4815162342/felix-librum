'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('sidebarController', ['$scope', '$location', 'queryParams', 'libraryQueryFilter', function($scope, $location, queryParams, libraryQuery) {
        // this is a list of the possible values for filter field.
        $scope.fields = libraryQuery.fields;
        // this is the filters passed in the URI.
        $scope.filter = {
            field: queryParams.filter.field(),
            text: queryParams.filter.text()
        }
        // but we have to watch them to update the URL.
        $scope.$watch("filter.field",function(newVal) {
            queryParams.filter.field(newVal);
        });

        // For the text, we don't want to update it all of the time,
        // because then we get a change for each keystroke. Just when
        // the user leaves the text field.
        $scope.updateFilterText = function() {
            queryParams.filter.text($scope.filter.text);
        }
        // TODO: Consider using a timer to update the text field if
        // no changes within one second.
        //$scope.$watch("filter.text",function(newVal) {
        //    
        //});
        

    }])
    .controller('itemsController', ['$scope', 'queryParams', '$filter', '$http', 'libraryQueryFilter', 'ngTableParams', '$timeout', 'pageLengths', function($scope,queryParams,$filter,$http,libraryQuery,ngTableParams,$timeout,pageLengths) {
        // initialize data.
        $scope.loading = true;
        // this is a function that helps rebuild the URL for links.
        $scope.urlParams = queryParams.urlParams;
        // Load query parameters into appropriate places
        $scope.filter = {
            field: queryParams.filter.field(),
            text: queryParams.filter.text()
        }
        $scope.page = {
            length: queryParams.page.length(),
            index: queryParams.page.index()
        }
        $scope.sort = queryParams.sort();

        // This one basically calls $http.get on the first call, then
        // rewrites the getData function to just return the data on
        // future calls. Sort of like caching.
        var getItems = function(cb) {
            $http.get('data/items.json').success(function(data) {
                getItems = function(cb) {
                    cb(null,libraryQuery(data,$scope.filter.field,$scope.filter.text));
                }
                $scope.loading = false;
                $scope.total = data.length;
                getItems(cb);
            }).error(function() {
                // TODO: Should pass the error information to callback.
                $scope.loading = false;
                $scope.total = 0;
              cb("An Error Occurred");
            });
        }

        $scope.tableParams = new ngTableParams({
            page: $scope.page.index,
            count: $scope.page.length,
            sorting: $scope.sort
        }, {
            counts: pageLengths,
            total: 0, // length of data
            getData: function($defer, params) {
                $scope.page.index = params.page();
                $scope.page.length = params.count();
                $scope.sort = params.sorting();
                queryParams.page.index($scope.page.index);
                queryParams.page.length($scope.page.length);
                queryParams.sort($scope.sort);
                
                getItems(function(err,data) {
                    $timeout(function() {
                        $scope.items = data;
                        if (err) {
                            params.total(0);
                            $defer.resolve([]);
                        } else {
                            params.total(data.length);
                            // use build-in angular filter
                            var orderedData = $scope.sort ?
                                                $filter('orderBy')(data, params.orderBy()) :
                                                data;
                            $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                        }
                    });
                });
                
            }
        }); 
        
        // We need to force a refresh of the table when the filter changes.
        $scope.$watch(function() {
            return queryParams.filter.field()  + "|" + queryParams.filter.text();
        },function() {
            $scope.filter.field = queryParams.filter.field();
            $scope.filter.text = queryParams.filter.text();
            $scope.tableParams.reload();
        })

    }])
  .controller('itemDetailController', ['$scope', '$routeParams', 'queryParams', '$http', 'filterFilter', function($scope,$routeParams,queryParams,$http,filter) {
        // this is a function that helps rebuild the URL for links.
        $scope.urlParams = queryParams.urlParams;
        $scope.itemKey = $routeParams.itemKey;
        // give it a blank to work with.
        $scope.item = {};
        $http.get('data/' + $scope.itemKey + '.json').success(function(data) {
          data.authors = [];
          data.illustrators = [];
          data.editors = [];
          // TODO: Do this filtering in the original data import.
          for (var i = 0; i < data.people.length; i++) {
              var person = data.people[i];
              switch (person.role) {
                case "author":
                    data.authors.push(person.name);
                    break;
                case "illustrator":
                    data.illustrators.push(person.name);
                    break;
                case "editor":
                    data.editors.push(person.name);
                    break;
                default:
                    // TODO: Figure out what to do with other roles.
                    break;
              }
          }
          $scope.item = data;
        });

        // This sets it up so that a change in the search field will
        // bring us back to the list.
        var firstCheck = true;
        $scope.$watch(function() {
            return queryParams.filter.field()  + "|" + queryParams.filter.text();
        },function() {
            if (!firstCheck) {
                queryParams.redirectToList();
            } else {
                firstCheck = false;
            }
        })
        
  }]);
