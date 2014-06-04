'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('itemsController', ['$scope', '$routeParams', '$filter', '$http', function($scope,$routeParams,$filter,$http) {
        $scope.loading = true;
      // NOTE: We are doing this here instead of in an 'instant filter'
      // with databinding, because it is much more responsive considering
      // the amount of data we start out with. Although, there may
      // be better ways to do this.
      
        var queryType = $routeParams.queryType && $routeParams.queryType.toLowerCase();
        var searchKey = $routeParams.searchKey && $routeParams.searchKey.toLowerCase();
        $scope.query = {
            type: queryType,
            key: searchKey
        }
        
        
        $http.get('data/items.json').success(function(data) {
            $scope.all = data;
            switch ($scope.query.type) {
                case "title":
                    $scope.items = $filter('filter')(data,function(value) {
                        return (value.title.toLowerCase().indexOf(searchKey) > -1) ||
                                (value.subtitle.toLowerCase().indexOf(searchKey) > -1) ||
                                (value.series.toLowerCase().indexOf(searchKey) > -1)
                    });
                    break;
                case "author":
                    $scope.items = $filter('filter')(data,function(value) {
                        return (value.author1.toLowerCase().indexOf(searchKey) > -1) ||
                                (value.author2.toLowerCase().indexOf(searchKey) > -1) ||
                                (value.author3.toLowerCase().indexOf(searchKey) > -1)
                    });
                    break;
                case "subject":
                    $scope.items = $filter('filter')(data,function(value) {
                        for (var i = 0; i < value.subjects.length; i++) {
                            if (value.subjects[i].toLowerCase().indexOf(searchKey) > -1) {
                                return true;
                            }
                        }
                        return false;
                    });
                    break;
                case "everything":
                    $scope.items = $filter('filter')(data,{ $: searchKey });
                    break;
                case "all":
                    $scope.items = data;
                    break;
            }
            $scope.loading = false;
        });
    }])
  .controller('itemDetailController', ['$scope', '$routeParams', '$http', function($scope,$routeParams,$http) {
      $scope.itemKey = $routeParams.itemKey;
      $http.get('data/' + $scope.itemKey + '.json').success(function(data) {
          $scope.item = data;
      });

  }]);
