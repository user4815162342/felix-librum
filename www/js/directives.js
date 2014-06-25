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
  // This allows me to assign variables in the scope of the controller
  // so that I can use them elsewhere in the template. This is used in 
  // the items template to specify the columns to appear in the table. 
  // In that case, I don't want the columns specified in the controller, 
  // since they are layout, not data, and don't belong there.
  // FUTURE: A better way might be to create a 'table' directive, but
  // that's a lot more code.
  directive('constant', function() {
      return {
          restrict: "EA",
          // no special scope, to ensure that I can set it on the
          // controller scope.
          scope: false,
          link: function(scope, element, attrs) {
              var val = scope.$eval(attrs.value);
              scope[attrs.name] = val;
              // remove the element. Once set, we don't need this anymore.
              element.remove();
          }
      }
  })
