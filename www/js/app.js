'use strict';

/* 
 * TODO: Need to work on style of items page:
 * - got a weird scrollbar thing going on there, eh?
 * - look at bootstrap CSS styles for tables.
 * - paginator can be centered, I think.
 * - needs to be a space between paginator and "show 10 items..." dropdown.
 * - actually, the paginator stuff can be on the same level as the 'message'.
 * - paginator should disappear if there's only one page.
 * - the sort caret needs to be over to the side, not next to the column label.
 * - the sort caret should point both ways when the column is not sorted.
 * TODO: Clicking on the 'search links' in the details will cause that
 * search to come up, but the search data isn't updated. This is
 * probably a matter of watching for changes in the location. But it
 * might not be that simple, because one of the other changes causes
 * the location to change, which will cause problems...
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
