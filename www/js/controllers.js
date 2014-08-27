'use strict';

/* Controllers */

angular.module('felixLibrum.controllers', [])
    .controller('queryController', ['$scope', '$location', 'queryParams', 'libraryQueryFilter', function($scope, $location, queryParams, libraryQuery) {
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
            $scope.filter.field = queryParams.filter.field();
            $scope.filter.text = queryParams.filter.text();
            setCurrentFilter($scope.filter.field);
        })
        
    }])
    .controller('itemsController', ['$scope', 'queryParams', 'orderByFilter', 'dataAccess', 'libraryQueryFilter', 'pageLengths', function($scope,queryParams,orderBy,dataAccess,libraryQuery,pageLengths) {
        
        // initialize data.
        $scope.loading = true;
        $scope.progress = 0;
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
            dataAccess.getItems(function(newProgress) {
                $scope.$evalAsync(function() {
                    $scope.progress = newProgress;
                });
            },function(err,data) {
                if (!err) {
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
                } else {
                    $scope.loadingStatus = err.message;
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
  .controller('itemDetailController', ['$scope', '$routeParams', 'queryParams', 'dataAccess', 'filterFilter', function($scope,$routeParams,queryParams,dataAccess,filter) {
        // this is a function that helps rebuild the URL for links.
        $scope.urlParams = queryParams.urlParams;
        $scope.itemKey = $routeParams.itemKey;
        // give it a blank to work with.
        $scope.item = {};
        dataAccess.getItem($scope.itemKey,function(err,data) {
            if (err) {
                console.log(err);
            } else {
                $scope.item = data;
            }
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
