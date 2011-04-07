define(["require"], function(require) {
  //  module:
  //    dojo/has
  //  summary:
  //    Defines the has.js API and several feature tests used by dojo.
  //  description:
  //    This module defines the has API as described by the project has.js with the following additional features:
  // 
  //      * the has test cache is exposed at has.cache.
  //      * the method has.add includes a forth parameter that controls whether or not existing tests are replaced
  //      * the loader's has cache may be optionally copied into this module's has cahce.
  // 
  //    This module adopted from https://github.com/phiggins42/has.js; thanks has.js team! 

  var
    global= this,
    doc= require.isBrowser && document,
    element= doc && doc.createElement("DiV"),
    cache= [],
      isBrowser= 
        // the most fundamental decision: are we in the browser?
        typeof window!="undefined";

  function has(name){
    //  summary: 
    //    Return the current value of the named feature.
    //
    //  name: String|Integer
    //    The name (if a string) or identifier (if an integer) of the feature to test.
    //
    //  description:
    //    Returns the value of the feature named by name. The feature must have been
    //    previously added to the cache by has.add.

    if(typeof cache[name] == "function"){
      return cache[name] = cache[name](/*global, doc, element*/); // do we need the params?
    }
    return cache[name]; // Boolean
  }

  has.cache= [];

	has.add = function(/* String|Object */name, /* Function */test){
		// summary: Register a new feature detection test for some named feature
		//
		// name: String
		//	  The name of the feature to test or you can provide an object hash with a set of tests.
		//
		// test: Function
		//	  A test function to register. If a function, queued for testing until actually
		//	  needed. The test function should return a boolean indicating
		//	  the presence of a feature or bug.
		//
		// example:
		//	  Add a set of has tests:
		//  |	   has.add({
		//  |		"javascript": true,
		//  |		"dom": function(){ return typeof document != "undefined'; }
		//  |		});
		//
		// example:
		//	  Again with the redundantness. You can do this in your tests, but we should
		//	  not be doing this in any internal has.js tests
		//  |	   has.add("javascript", true);
		//
		// example:
		//	  Three things are passed to the testFunction. `global`, `document`, and a generic element
		//	  from which to work your test should the need arise.
		//  |	   has.add("bug-byid", function(g, d, el){
		//  |		   // g  == global, typically window, yadda yadda
		//  |		   // d  == document object
		//  |		   // el == the generic element. a `has` element.
		//  |		   return false; // fake test, byid-when-form-has-name-matching-an-id is slightly longer
		//  |	   });
		if(typeof name == "object"){
			for(var i in name){
				has.add(i, name[i]);
			}
		}else{
			cache[name] = test;
		}
	};
	var agent = navigator.userAgent;
	// Common application level tests
	has.add({
		"touch": "ontouchstart" in document,
		// I don't know if any of these tests are really correct, just a rough guess
		"device-width": screen.availWidth || innerWidth,
		"agent-ios": !!agent.match(/iPhone|iP[ao]d/),
		"agent-android": agent.indexOf("android") > 1,
    // since we're operating under a loader that doesn't provide a has API, we must explicitly initialize
    // has as it would have otherwise been initialized by the dojo loader; use has.add to the builder
    // can optimize these away iff desired
    "host-browser": isBrowser,
    "dom": isBrowser,
    "host-addEventListener": doc && !!doc.addEventListener,
    "loader-pageLoadApi": 1,
    "dojo-sniff": 1
	});
  has.load= function(id, parentRequire, loaded){
    // summary: 
    //   Conditional loading of AMD modules based on a has feature test value.
    //
    // mid: String
    //   Gives the has feature name, a module to load when the feature exists, and optionally a module
    //   to load when the feature is false. The string had the format `"feature-name!path/to/module!path/to/other/module"`
    //
    // require: Function
    //   The loader require function with respect to the module that contained the plugin resource in it's
    //   dependency list.
    // 
    // load: Function
    //   Callback to loader that consumes result of plugin demand.
  
		var tokens = id.match(/[\?:]|[^:\?]*/g), i = 0;
		function get(skip){
			var operator, term = tokens[i++];
			if(term == ":"){
				// empty string module name, resolves to undefined
				return;
			}else{
				// postfixed with a ? means it is a feature to branch on, the term is the name of the feature
				if(tokens[i++] == "?"){
					if(!skip && has(term)){
						// matched the feature, get the first value from the options 
						return get();
					}else{
						// did not match, get the second value, passing over the first
						get(true);
						return get(skip);
					}
				}
				// a module
				return term;
			}
		}
		id = get();
		if(id){
			parentRequire([id], loaded);
		}else{
			loaded();
		}
  };
  return has;
});
