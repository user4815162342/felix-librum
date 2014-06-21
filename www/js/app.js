'use strict';

/* 
 * TODO: Can't sort correctly by author. Maybe we need to have an
 * 'author1', 'author2', etc. set of fields anyway. Or, sorting should
 * be done based on only the first author.
 * TODO: UI tweaks: we need some margins in a few places, not sure if
 * there's more stuff.
 * TODO: Need to make the item details page look nicer. Group the fields
 * together.
 * TODO: I think we can clean up the controller code a little bit for
 * the items page. We might be able to do filtering internally, and
 * use angular's location service to change query parameters instead
 * of routing to create a permalink.
 * TODO: Need Loading animations 
 * TODO: Go through bower dependencies and figure out if we have
 * something we don't need, or there are minimized versions available.
 * TODO: Need to figure out what those unknown fields are.
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
  $routeProvider.when('/items/:queryType?/:queryText?', {templateUrl: 'partials/items.html', controller: 'itemsController'})
  // The queryType and queryText are passed on through to this. I prefer not
  // to use cookies or session/localStorage, because 1) It caches usage data
  // which is unnecessary and not fair to the user and 2) it often causes
  // unexpected values to pop in when the user isn't expecting it: say it's
  // been six months since the last search, and these values pop in that
  // don't make any sense.
  $routeProvider.when('/item/:queryType?/:queryText?/:itemKey', {templateUrl: 'partials/item-detail.html', controller: 'itemDetailController'});
  $routeProvider.otherwise({redirectTo: '/items/'});
}]);
