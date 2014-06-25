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

        // For the text, we don't want to update it all of the time,
        // because then we get a change for each keystroke. Just when
        // the user leaves the text field. Therefore, this function
        // is attached to ngBlur instead of ngChange.
        $scope.setText = function(text) {
            queryParams.filter.text(text);
        }
        // TODO: Consider using a timer to update the text field after
        // a change, if there's no more changes in one second.
        
        $scope.setField = function(text) {
            console.log("Setting field",text);
            queryParams.filter.field(text);
        }
        
        // And now, watch the url, to update the fields.
        $scope.$watch(function() {
            return queryParams.urlParams()
        },function(newVal) {
            $scope.filter.field = queryParams.filter.field(),
            $scope.filter.text = queryParams.filter.text()
        })
        
        // 
        $scope.checkEnter = function(event) {
            console.log(event.keyCode == 13);
            console.log((event.keyCode == 13) && $scope.setText($scope.filter.text));
            console.log(event);
        }
        
    }])
    .controller('itemsController', ['$scope', 'queryParams', 'orderByFilter', '$http', 'libraryQueryFilter', 'pageLengths', function($scope,queryParams,orderBy,$http,libraryQuery,pageLengths) {
        
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
        
        // NMS: There's no reason to call this, because the $watch below
        // on urlParams will be triggered after the page loads anyway.
        //refreshData();

        $scope.$watch(function() {
            return queryParams.urlParams()
        },function() {
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
