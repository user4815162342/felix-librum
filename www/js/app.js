'use strict';

/* 
 * TODO: Can't sort correctly by author. Maybe we need to have an
 * 'author1', 'author2', etc. set of fields anyway. Or, sorting should
 * be done based on only the first author.
 * TODO: When you go back in the history after changing the page number
 * or pagination count, it doesn't refresh with the new data.
 * TODO: Need to make the item details page look nicer. Group the fields
 * together.
 * TODO: Need Loading animations, or some sort of thing on the table
 * itself.
 * TODO: UI tweaks: we need some margins in a few places, not sure if
 * there's more stuff.
 * TODO: Go through bower dependencies and figure out if we have
 * something we don't need, or there are minimized versions available.
 * TODO: Need to figure out what those unknown fields are. (They
 * contain no data, so I guess the answer is stuck on the machine at
 * school)
 * TODO: Need to clean up the original data so that this stuff looks
 * better.
 * TODO: Need a better name for the application. Suggestions:
 *  - SimpleCat
 *  - CatBird
 *  - SimpleOPAC
 *  - OPACBird
 *  - LibraryCat
 *  - BirdCat
 *  - SmallCat
 *  - LibraryKitty.
 * TODO: Goal: A purely JavaScript driven interface, so it doesn't
 * have to depend on the architecture of the back end. User should be
 * able to search by title, and author and subject.
 * TODO: May Need to break up lots of results data into smaller chunks for quicker loading. 
 * Probably have to paginate them somehow.
 * 
 * */


// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'ngRoute',
  // NOTE: ng-grid is part of angular UI, but the current version depends on jQuery, which I don't want.
  // This one seems to work, though.
  'ngTable',
  'ui.bootstrap',
  'myApp.filters',
  'myApp.services',
  'myApp.directives',
  'myApp.controllers'
]).
config(['$routeProvider', function($routeProvider) {
    // we set reloadOnSearch to false to prevent refreshing of the view when we update the URL. Pretty much all of the
    // search params only exist to maintain state for the URL, and they've already been rendered by the time it's
    // updated (or, in the case of 'detail', they aren't even needed for rendering).
  $routeProvider.when('/list', {templateUrl: 'partials/items.html', controller: 'itemsController', reloadOnSearch: false})
  $routeProvider.when('/detail/:itemKey', {templateUrl: 'partials/item-detail.html', controller: 'itemDetailController', reloadOnSearch: false});
  $routeProvider.otherwise({redirectTo: '/list'});
}]);
