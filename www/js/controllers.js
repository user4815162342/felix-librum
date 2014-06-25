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
        // the user leaves the text field. This function is attached
        // to an event.
        $scope.updateFilterText = function() {
            queryParams.filter.text($scope.filter.text);
        }
        // TODO: Consider using a timer to update the text field if
        // no changes within one second.
        //$scope.$watch("filter.text",function(newVal) {
        //    
        //});
        

    }])
    .controller('itemsController', ['$scope', 'queryParams', 'orderByFilter', '$http', 'libraryQueryFilter', '$timeout', 'pageLengths', function($scope,queryParams,orderBy,$http,libraryQuery,$timeout,pageLengths) {
        
        // initialize data.
        $scope.loading = true;
        $scope.pageLengths = pageLengths;
        // this is a function that helps rebuild the URL for writing links in the template.
        $scope.urlParams = queryParams.urlParams;

       /* NOTE: I tried a couple of different plug-in table components, 
        * but the major problem is that they didn't play well with 
        * keeping the parameters in the $location. I wanted it to set 
        * $location, and let a change to $location cause the data 
        * refresh. Which means I can keep the $location updated with 
        * it's data, but attempting to listen to the $location change 
        * to update the data caused problems. Which means, when the 
        * user goes back and forth in the history, the screen didn't 
        * stay updated to the changed $location. */

        var refreshData = function() {
            $http.get('data/items.json').success(function(data) {
                refreshData = function(cb) {
                    $scope.$evalAsync(function() {
                        // get data into the scope
                        var sort = $scope.sort = queryParams.sort();
                        var pageLength = $scope.pageLength = queryParams.page.length();
                        var pageIndex = $scope.pageIndex = queryParams.page.index();
                        var filterField = $scope.filterField = queryParams.filter.field();
                        var filterText = $scope.filterText = queryParams.filter.text();
                        
                        // run filter
                        var result = libraryQuery(data,filterField,filterText);
                        // TODO: Do I need this?
                        $scope.filteredTotal = result.length;
                        var lastPage = $scope.lastPage = Math.ceil(result.length / pageLength);
                        if (pageIndex >= lastPage) {
                            pageIndex = $scope.pageIndex = lastPage;
                        }                            
                        // run sort
                        result = orderBy(result, sort);
                        // run pagination.
                        $scope.filteredItems = result.slice((pageIndex - 1) * pageLength,pageIndex * pageLength);
                    });
                }
                $scope.loading = false;
                $scope.total = data.length;
                refreshData();
            }).error(function() {
                // TODO: Should indicate error information, at least unless
                // we got a 404, in which case we have no data.
                $scope.loading = false;
                $scope.total = 0;
            });
        }
        
        refreshData();
        // TODO: Now, we just need click handlers on the sortable th,
        // and paginator from bootstrap. These things should update the URL,
        // and the URL watch will cause a refresh data.

        // TODO: Question, does this run automatically on start?
        $scope.$watch(function() {
            return queryParams.urlParams()
        },function(newVal) {
            refreshData();
        })
        
        var curSort = null;
        var curSortAsc = true;
        
        $scope.setSort = function(value) {
            if (value == curSort) {
                curSortAsc = !curSortAsc;
            } else {
                curSortAsc = true;
            }
            curSort = value;
            queryParams.sort((curSortAsc ? "+" : "-") + value);
        }
        
        $scope.setPage = function(value) {
            queryParams.page.index(value);
        }
        
        $scope.setPageLength = function(value) {
            queryParams.page.length(value);
        }
        
        $scope.log = function(value) {
            console.log(value);
        }
        

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
