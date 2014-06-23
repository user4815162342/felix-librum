'use strict';

/* 
 * TODO: When you go back in the history after changing the page number
 * or pagination count, it doesn't show the appropriate data. Similar
 * problems with going back to results from details. Also with the
 * sort fields.
 * Reproduce A: 
 * 1. start out at a fresh list, with no parameters.
 * 2. Click on page 2.
 * 3. Press browser's back key.
 * + Should show page 1, but it still shows page 2.
 * Reproduce B: 
 * 1. start out at a fresh list, with no parameters.
 * 2. Click on page length of 25.
 * 3. Press browser's back key.
 * + Should show a page length of 10, but still shows page length of 25.
 * Reproduce C:
 * 1. start out at a fresh list, with no parameters.
 * 2. Click on 'subtitle' to sort by that field.
 * 3. Press browser's back key.
 * + Should show the unsortedlist, but still shows the subtitle sort.
 * Reproduce D (might be a different problem):
 * 1. start out at a fresh list, with no parameters.
 * 2. Click on 'subtitle' to sort by that field.
 * 3. Click on the first title in the list. 
 * 4. Press browser's back key.
 * + Should show the sorted list, but this time the list is unsorted.
 * Some of this is fixed, but some of it isn't. For example, I can now
 * go back in the history, but forward doesn't work.
 * *** This would be so much easier if we just depended on the update
 * to the URL to refresh things, and have the buttons in the table to
 * update that URL. 
 * TODO: Clicking on the 'search links' in the details will cause that
 * search to come up, but the search data isn't updated.
 * TODO: To simplify the templates, instead of a single "people" field, we
 * should have seperate author, editor and illustrator fields which
 * can contain arrays.
 * TODO: In fact, we can do some parsing of the authors field for now,
 * if we see things like ", ill." at the end, it's an illustrator, ", ed."
 * is an editor, etc. Can also parse out the years of life for them.
 * TODO: If you click on one of the links in the details to search by
 * author, subject, etc. It doesn't update the search bar with those
 * parameters.
 * TODO: Need Loading animations, or some sort of thing on the table
 * itself.
 * TODO: Go through bower dependencies and figure out if we have
 * something we don't need, or there are minimized versions available.
 * TODO: Need to figure out what those unknown fields are. (They
 * contain no data, so I guess the answer is stuck on the machine at
 * school)
 * TODO: If the unknown fields aren't important, I need publisher,
 * publishCity and publishYear from the database. I probably need
 * a better export system.
 * TODO: I need to remove the Lost and Discarded books from the import.
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
