'use strict';

// TODO: Need to confirm that it's okay for us to link to AR.

/* TODO: Move over to gulp for building, and possibly the import tool
 * as well.
 * TODO: Concatenate/Compress/minify the JavaScript/CSS to allow to reduce the size
 * of this whole thing.
 * */

/*
 * GOAL: A purely JavaScript driven interface, so it doesn't
 * have to depend on the architecture of the back end. User should be
 * able to search by title, author, subject, and more. */


// Declare app level module which depends on filters, and services
angular.module('felixLibrum', [
  'ngRoute',
  'ui.bootstrap',
  'felixLibrum.filters',
  'felixLibrum.services',
  'felixLibrum.directives',
  'felixLibrum.controllers',
  'felixLibrum.site'
]).
config(['$routeProvider', function($routeProvider) {
    // we set reloadOnSearch to false to prevent refreshing of the view when we update the URL. Pretty much all of the
    // search params only exist to maintain state for the URL, and they've already been rendered by the time it's
    // updated (or, in the case of 'detail', they aren't even needed for rendering).
  $routeProvider.when('/list', {templateUrl: 'partials/items.html', controller: 'itemsController', reloadOnSearch: false})
  $routeProvider.when('/detail/:itemKey', {templateUrl: 'partials/item-detail.html', controller: 'itemDetailController', reloadOnSearch: false});
  $routeProvider.otherwise({redirectTo: '/list'});
}])
