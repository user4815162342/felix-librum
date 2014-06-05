'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('sidebarController', ['$scope', '$route', 'libraryQueryFilter', function($scope, $route, libraryQuery) {
        $scope.queryType = $route.current.params.queryType || "";
        $scope.queryText = $route.current.params.queryText || "";
        $scope.queryTypes = libraryQuery.queryTypes;

    }])
    .controller('itemsController', ['$scope', '$routeParams', '$filter', '$http', 'libraryQueryFilter', function($scope,$routeParams,$filter,$http,libraryQuery) {
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
