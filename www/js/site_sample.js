'use strict';

/* This contains site-specific configuration. It should be renamed
 * to site.js in order to get the information out of it, and this must
 * be done after every checkout. site.js is ignored in .gitignore, so 
 * customer-specific forks will fnot get overridden. */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('felixLibrum.site', []).
  value('libraryName','Your Library');
