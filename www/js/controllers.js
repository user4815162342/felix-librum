'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('sidebarController', ['$scope', '$route', function($scope, $route) {
        $scope.queryType = $route.current.params.queryType || "";
        $scope.queryText = $route.current.params.queryText || "";
        $scope.queryTypes = [
            {
                type: "title",
                label: "Search by title"
            },
            {
                type: "author",
                label: "Search by author"
            },
            {
                type: "subject", 
                label: "Search by subject"
            }
        ]

    }])
    .controller('itemsController', ['$scope', '$routeParams', '$filter', '$http', function($scope,$routeParams,$filter,$http) {
        $scope.loading = true;
      
        var queryType = $scope.queryType = $routeParams.queryType;
        var queryText = $scope.queryText = $routeParams.queryText;
        if (queryType) {
            queryType = queryType.toLowerCase();
        }
        if (queryText) {
            queryText = queryText.toLowerCase();
        }
        
      // NOTE: We are doing this here instead of in an 'instant filter'
      // with databinding, because it is much more responsive considering
      // the amount of data we start out with. Although, there may
      // be better ways to do this.
        $http.get('data/items.json').success(function(data) {
            $scope.all = data;
            if (queryText === "") {
                $scope.items = [];
            } else {
                switch (queryType) {
                    case "title":
                        $scope.items = $filter('filter')(data,function(value) {
                            return (value.title.toLowerCase().indexOf(queryText) > -1) ||
                                    (value.subtitle.toLowerCase().indexOf(queryText) > -1) ||
                                    (value.series.toLowerCase().indexOf(queryText) > -1)
                        });
                        break;
                    case "author":
                        $scope.items = $filter('filter')(data,function(value) {
                            for (var i = 0; i < value.people.length; i++) {
                                if (value.people[i].name.toLowerCase().indexOf(queryText) > -1) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        break;
                    case "subject":
                        $scope.items = $filter('filter')(data,function(value) {
                            for (var i = 0; i < value.subjects.length; i++) {
                                if (value.subjects[i].toLowerCase().indexOf(queryText) > -1) {
                                    return true;
                                }
                            }
                            return false;
                        });
                        break;
                    case "everything":
                        $scope.items = $filter('filter')(data,{ $: queryText });
                        break;
                    case "all":
                        $scope.items = data;
                        break;
                }
            }
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
      $http.get('data/' + $scope.itemKey + '.json').success(function(data) {
          $scope.item = data;
      });

  }]);
