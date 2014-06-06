'use strict';

/* 
 * TODO: Fixing the grid, it looks nice, but there are still some
 * style problems. Number one is that the column sizes move all over
 * the place.
 * TODO: Can't sort correctly by author. Maybe we need to have an
 * 'author1', 'author2', etc. set of fields anyway. 
 * TODO: Need to clean up the user interface quite a bit.
 * - sidebar should actually be on the side. (Actually, maybe, it
 * should go in the header, since it's not all that complicated)
 * - layout should look more professional.
 * - should be a 'header/footer/sidebar/content' layout, with the 
 * scrollbars only appearing in the content division.
 * - Grid should be sortable, possibly filterable.
 * - item detail should be arranged a little more nicely to group
 * information together into what's important.
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
