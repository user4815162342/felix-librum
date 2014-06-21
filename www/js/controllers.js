'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('sidebarController', ['$scope', '$route', 'libraryQueryFilter', function($scope, $route, libraryQuery) {
        $scope.queryType = $route.current.params.queryType || "";
        $scope.queryText = $route.current.params.queryText || "";
        $scope.queryTypes = libraryQuery.queryTypes;

    }])
    .controller('itemsController', ['$scope', '$routeParams', '$filter', '$http', 'libraryQueryFilter', 'ngTableParams', function($scope,$routeParams,$filter,$http,libraryQuery,ngTableParams) {
        $scope.loading = true;
      
        $scope.queryType = $routeParams.queryType;
        $scope.queryText = $routeParams.queryText;
        
      // NOTE: We are doing this here instead of in an 'instant filter'
      // with databinding, because it is much more responsive considering
      // the amount of data we start out with. Although, there may
      // be better ways to do this.
        $http.get('data/items.json').success(function(data) {
            $scope.all = data;
            $scope.items = libraryQuery(data,$scope.queryType,$scope.queryText);
            // TODO: With the new table component, the display works a lot
            // more quickly. I can very possibly do the filtering internally
            // now. Except I want to keep the URL anyway, to make it
            // easier to share. If it's possible to integrate our filter
            // into the table, it would be great. But, if not, our
            // filter should be able to 'refresh' the table.
            
            $scope.tableParams = new ngTableParams({
                page: 1,            // show first page
                count: 10
            }, {
                total: $scope.items.length, // length of data
                getData: function($defer, params) {
                    // use build-in angular filter
                    var orderedData = params.sorting() ?
                                        $filter('orderBy')($scope.items, params.orderBy()) :
                                        $scope.items;
                    $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
                }
            }); 
            
            
            $scope.loading = false;
        }).error(function() {
            // TODO: Should report the error instead of silently failing,
            // and only do this if the error is a 404.
          $scope.all = [];
          $scope.items = [];
          $scope.loading = false;  
        });
    }])
  .controller('itemDetailController', ['$scope', '$routeParams', '$http', function($scope,$routeParams,$http) {
      $scope.itemKey = $routeParams.itemKey;
      $scope.queryType = $routeParams.queryType;
      $scope.queryText = $routeParams.queryText;
      $http.get('data/' + $scope.itemKey + '.json').success(function(data) {
          $scope.item = data;
      });

  }]);
