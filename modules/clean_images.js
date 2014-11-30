var logging = require("./logging");
var config = require("./config");
var df = require("node-df");
var fs = require("fs");

var exp = {};

// uses `df` to get the available fisk space
// callback contains error, true|false
function should_clean(callback) {
  df({
    file: __dirname + "/../" + config.faces_dir,
    prefixMultiplier: 'KiB',
    isDisplayPrefixMultiplier: false,
    precision: 2
  }, function (err, response) {
    if (err) {
      callback(err, false);
    } else {
      var available = response[0].available;
      console.log("ImageCleaner: " + available + "KB available");
      callback(err, available < config.cleaning_limit);
    }
  });
}

// check if disk limit reached
// then delete images
exp.run = function() {
  should_clean(function(err, clean) {
    if (err) {
      logging.error("Failed to run ImageCleaner");
      logging.error(err);
    } else if (clean) {
      logging.warn("ImageCleaner: Disk limit reached! Cleaning images now");
      var skindir = __dirname + "/../" + config.faces_dir;
      var helmdir = __dirname + "/../" + config.helms_dir;
      var files = fs.readdirSync(skindir);
      for (var i = 0; i < Math.min(files.length, config.cleaning_amount); i++) {
        var filename = files[i];
        if (filename[0] != ".") {
          fs.unlink(skindir + filename, function(){});
          fs.unlink(helmdir + filename, function(){});
        }
      }
    } else {
      logging.log("ImageCleaner: Nothing to clean");
    }
  });
};

module.exports = exp;