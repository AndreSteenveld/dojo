function rhinoDojoConfig(config, baseUrl, rhinoArgs) {
  // rhino
  // TODO: v1.6 tries to set dojo.doc and dojo.body in rhino; why?
 
  // get a minimal console up
  var log= function(hint, args) {
    print((hint ? hint + ":" : "") + args[0]);
    for (var i= 1; i<args.length; i++) {
      print(", " + args[i]);
    }
  };
  // intentionally define console in the global namespace
  console= {
    log: function(){ log(0, arguments); },
    error: function(){ log("ERROR", arguments); },
    warn: function(){ log("WARN", arguments); }
  };

  // any command line arguments with the load flag are pushed into deps
  for (var deps= [], i= 0; i<rhinoArgs.length; i++) {
    var arg= (rhinoArgs[i]+"").split("=");
    if (arg[0]=="load") {
      deps.push(arg[1]);
    }
  }

  // provides timed callbacks using Java threads
  if(typeof setTimeout == "undefined" || typeof clearTimeout == "undefined"){
  	var timeouts = [];
  	clearTimeout = function(idx){
  		if(!timeouts[idx]){ return; }
  		timeouts[idx].stop();
  	};
  
  	setTimeout = function(func, delay){
  		var def={
  			sleepTime:delay,
  			hasSlept:false,
  		
  			run:function(){
  				if(!this.hasSlept){
  					this.hasSlept=true;
  					java.lang.Thread.currentThread().sleep(this.sleepTime);
  				}
  				try{
  					func();
  				}catch(e){
  					console.debug("Error running setTimeout thread:" + e);
  				}
  			}
  		};
  	
  		var runnable = new java.lang.Runnable(def);
  		var thread = new java.lang.Thread(runnable);
  		thread.start();
  		return timeouts.push(thread)-1;
  	};
  }

  var isLocal= function(url) {
    return (new java.io.File(url)).exists();
  };

  // make sure global require exists
  if (typeof require=="undefined") {
    require= {};
  }

  // reset the has cache with rhino-appropriate values; 
  // note: for clarity, this exactly the cache taken from dojo.js and edited
  config.has.cache= {
    "host-rhino":1,
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

  // reset some configuration switches with rhino-appropriate values
  var rhinoConfig= {
    baseUrl:baseUrl,
    host:"rhino",
    isBrowser:0,
    commandLineArgs:rhinoArgs,
    deps:deps,
    timeout:0,
    locale:String(java.util.Locale.getDefault().toString().replace('_','-').toLowerCase()),

    injectUrl: function(url, callback) {
      try {
        if (isLocal(url)) {
          load(url);
        } else {
          require.eval(readUrl(url, "UTF-8"));
        }
        callback();
      } catch(e) {
        console.log("failed to load resource (" + url + ")");
        console.log(e);
      }
    },

    getXhr: 0,

    getText: function(url, sync, onLoad) {
			// TODO: test https://bugzilla.mozilla.org/show_bug.cgi?id=471005; see v1.6 hostenv_rhino
      // note: async mode not supported in rhino
      onLoad(isLocal(url) ? readFile(url, "UTF-8") : readUrl(url, "UTF-8"));
    }
  };
  for (var p in rhinoConfig) {
    config[p]= rhinoConfig[p];
  }
  return config;
}
