var browsers = ['firefox','chrome'];
var uri = "http://localhost:8000/www/index.html";

var launcher = require('browser-launcher');

launcher(function (err, launch) {
    if (err) return console.error(err);
    
    browsers.forEach(function(browser) {
        console.log("Launching ", browser);
        launch(uri,{ browser: browser },function(err, ps) {
            if (err) {
                return console.error(err);
            }
        });
    });

});

