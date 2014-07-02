angular.module('myApp.mock.tools', []).value('$location', {
      search: function() {
          //console.log("$location.search",arguments[0],arguments[1]);
          if (arguments.length) {
              if (arguments[1]) {
                  this.__query[arguments[0]] = arguments[1];
              } else {
                  delete this.__query[arguments[0]];
              }
          } 
          return this.__query
      },
      url: function() {
          return "http://127.0.0.1/index.html#" + this.__path + "?" +
                Object.keys(this.__query).map(function(key) {
                    return key + "=" + this.__query[key]
                }.bind(this)).join("&");
      },
      path: function(value) {
          if (arguments.length) {
              this.__path = value;
          }
          return "http://127.0.0.1/index.html#" + this.__path;
      },
      __query: {},
      __path: "/detail/23"
  });
