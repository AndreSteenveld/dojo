exports.config= function(config) {
  // node.js

  // any command line arguments with the load flag are pushed into deps
  for (var deps= [], args= [], i= 0; i<process.argv.length; i++) {
    var arg= (process.argv[i]+"").split("=");
    if (arg[0]=="load") {
      deps.push(arg[1]);
    } else {
      args.push(arg);
    }
  }

  var fs= require("fs");

  // make sure global require exists
  if (typeof global.require=="undefined") {
    global.require= {};
  }

  // reset the has cache with node-appropriate values; 
  // note: for clarity, this exactly the cache taken from dojo.js and edited
  config.has.cache= {
    "host-node":1,
    //"dom":isBrowser,
    //"dom-addEventListener":isBrowser && !!document.addEventListener,
    "console":1,
    "loader-injectApi":1,
    //"loader-timeoutApi":1,
    "loader-traceApi":1,
    "loader-catchApi":1,
    //"loader-pageLoadApi":1,
    "loader-readyApi":1,
    "loader-errorApi":1,
    //"loader-sniffApi":0,
    //"loader-undefApi":0,
    //"loader-requirejsApi":1,
    //"loader-createHasModule":0,
    "loader-amdFactoryScan":1,
    "loader-publish-privates":1,
    //"dojo-sniff":1,
    "dojo-loader":1,
    "dojo-boot":1,
    "dojo-test-sniff":1
  };

  // reset some configuration switches with node-appropriate values
  var nodeConfig= {
    baseUrl: __dirname.match(/(.+)\/_base$/)[1],
    host:"node",
    isBrowser:0,
    commandLineArgs:args,
    deps:deps,
    timeout:0,
  
    // TODO: really get the locale
    locale:"us-en",

    debug: function(item) {
      // define debug for console messages during dev instead of console.log
      // (node's heavy async makes console.log confusing sometimes)
      require("util").debug(item);
    },

    eval: function(__text, __urlHint) {
      return process.compile(__text, __urlHint);
    },

    injectUrl: function(url, callback) {
      try {
        process.compile(fs.readFileSync(url, "utf8"), url);
        callback();
      } catch(e) {
        console.log("failed to load resource (" + url + ")");
        console.log(e);
      }
    },

    getXhr: 0,

    getText: function(url, sync, onLoad){
      // TODO: implement async and http/https handling
      onLoad(fs.readFileSync(url, "utf8"));
    }
  };
  for (var p in nodeConfig) {
    config[p]= nodeConfig[p];
  }

  return config;
};
