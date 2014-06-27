'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('sidebarController', ['$scope', '$location', 'queryParams', 'libraryQueryFilter', function($scope, $location, queryParams, libraryQuery) {
        // this is a list of the possible values for filter field.
        var fields = $scope.fields = libraryQuery.fields;
        // this is the filters passed in the URI.
        $scope.filter = {
            field: queryParams.filter.field(),
            text: queryParams.filter.text()
        }
        
        var setCurrentFilter = function(sort) {
            $scope.currentFilter = null;
            for (var i = 0; i < fields.length; i++) {
                if (fields[i].type === sort) {
                    $scope.currentFilter = fields[i];
                    break;
                }
            }
        }
        setCurrentFilter($scope.filter.field);

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
            setCurrentFilter(text);
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
        $scope.loadingStatus = "Loading Data...";
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
            // The parameter is added to make sure we don't reload cached
            // data after changes are made. 
            $http.get('data/items.json?7').success(function(data) {
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
                        var filteredTotal = $scope.filteredTotal = result.length;
                        // run sort
                        result = orderBy(result, sort);
                        // run pagination.
                        $scope.filteredItems = result.slice((pageIndex - 1) * pageLength,pageIndex * pageLength);
                        if (filteredTotal == $scope.total) {
                            $scope.loadingStatus = "The library has " + filteredTotal + " items in its catalog.";
                        } else if (filteredTotal) {
                            $scope.loadingStatus = "" + filteredTotal + " items match your query.";
                        } else {
                            $scope.loadingStatus = "No items match your query.";
                        }
                        $scope.loading = false;
                    });
                }
                $scope.total = data.length;
                refreshData();
            }).error(function(data,status,headers,config) {
                if (status === 404) {
                    // we've simply got no data. But don't override the get
                    // in case someone puts some in.
                    $scope.sort = queryParams.sort();
                    $scope.pageLength = queryParams.page.length();
                    $scope.pageIndex = queryParams.page.index();
                    $scope.filterField = queryParams.filter.field();
                    $scope.filterText = queryParams.filter.text();
                    $scope.filteredTotal = 0;
                    $scope.filteredItems = [];
                    $scope.total = 0;
                    $scope.loadingStatus = "The library has no items in its catalog.";
                } else {
                    $scope.loadingStatus = "An error occurred retrieving the data (" + status + "). Please refresh to try again.";
                }
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
        
        $scope.setSort = function(value) {
            var oldSort = queryParams.sort();
            if (oldSort && (oldSort.substr(1) === value)) {
                switch (oldSort[0]) {
                    case "+":
                        queryParams.sort("-" + value);
                        break;
                    case "-":
                    default:
                        queryParams.sort(null);
                        break;
                }
            } else if (value) {
                queryParams.sort("+" + value);
            } else {
                queryParams.sort(null);
            }
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
