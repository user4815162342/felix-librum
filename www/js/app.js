'use strict';


/* 
 * TODO: Need a better name for the application. Suggestions:
 *  - SimpleCat
 *  - CatBird
 *  - SimpleOPAC
 *  - OPACBird
 *  - LibraryCat
 *  - BirdCat
 *  - SmallCat
 *  - LibraryKitty.
 * TODO: Need to figure out what those unknown fields are. (They
 * contain no data, so I guess the answer is stuck on the machine at
 * school)
 * TODO: If the unknown fields aren't important, I need publisher,
 * publishCity and publishYear from the database. I probably need
 * a better export system.
 * TODO: Check the title "Our Star--The Sun" by Estalella in the 
 * original database. There's a charactere encoding issue in the
 * second authors name. Attempting to reload the tsv file in various
 * encodings does not fix this, verify whether this is in the
 * original data, the output, or something else I did.
 * TODO: Need to clean up the original data so that this stuff looks
 * better.
 * 
 * */

/*
 * GOAL: A purely JavaScript driven interface, so it doesn't
 * have to depend on the architecture of the back end. User should be
 * able to search by title, author, subject, and more. */


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
}])
