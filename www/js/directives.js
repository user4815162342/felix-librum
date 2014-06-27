'use strict';

/* Directives */


angular.module('myApp.directives', []).
  directive('appVersion', ['version', function(version) {
    return function(scope, elm, attrs) {
      elm.text(version);
    };
  }]).
  directive('appName', ['name', function(name) {
      return function(scope, elm, attrs) {
          elm.text(name);
      };
  }]).
  directive('sortableColumn', function($templateCache) {
      return {
          /* NOTE: This 'replace' is marked as deprecated in Angular
           * docs. I can understand their reasons for not liking it,
           * but it's necessary. If it ever gets removed, we'll have 
           * problems, since there's no element that makes sense to
           * wrap a TH, and no way to apply the attributes I need.
           * I'll probably have to write a compile or link function 
           * to load the template and apply the attributes myself. */
          replace: true,
          transclude: true,
          scope: {
              sorted: "&",
              sortDir: "&"
          },
          // TODO: The query parameter on here overrides an apparent
          // problem I had. When I change the contents of this file,
          // it was not showing the changes on reload, even when I do a 
          // Ctrl-Shift-R (force reload without cache). Watching the
          // network requests, it isn't even *checking* for a new one,
          // and getting a not-modified response. It simply wasn't even
          // getting it. It didn't make any sense. The only way to reset
          // it was to clear the browser's entire cache.
          // --- Anyway, if you increment this query parameter after
          // making a change, it will change the cache key and force it
          // to reload.
          templateUrl: "partials/sortable-column.html?30",
          link: function(scope, element, attrs) {
          }
      }
  });
