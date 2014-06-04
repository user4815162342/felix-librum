'use strict';

/* 
 * TODO: The 'author1..3' should probably be an array of names and roles (illustrator, editor, etc.)
 * TODO: May Need to break up lots of results data into smaller chunks for quicker loading. 
 * Probably have to paginate them somehow.
 * TODO: For title search, need to be able to know whether the string is
 * from the title, subtitle or series name.
 * TODO: The item-details page should just be able to display a whole bunch of results,
 * and then the user can just click on the 'title' or 'subject' found and get the result.
 * TODO: Need to clean up the user interface quite a bit.
 * TODO: Need Loading animations 
 * TODO: Need to filter and search.
 * TODO: Need to figure out what those unknown fields are.
 * TODO: Goal: A purely JavaScript driven interface, so it doesn't
 * have to depend on the architecture of the back end. User should be
 * able to search by title, and author and subject.
 * 
 * */


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/items/:queryType?/:searchKey?', {templateUrl: 'partials/items.html', controller: 'itemsController'})
  $routeProvider.when('/item/:itemKey', {templateUrl: 'partials/item-detail.html', controller: 'itemDetailController'});
  $routeProvider.otherwise({redirectTo: '/items/'});
}]);
