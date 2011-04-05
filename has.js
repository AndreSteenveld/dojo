define(["require"], function(require) {
  //  module:
  //    dojo/has
  //  summary:
  //    Defines the has.js API and several feature tests used by dojo.
  //  description:
  //    This module defines and has the value of the has function as described by the 
  //    project has.js. The has function includes the method add and the property cache; 
  //    other methods/properties defined by the has.js project are not included.
  // 
  //    This module adopted from https://github.com/phiggins42/has.js; thanks has.js team! 

  var
    global= this,
    doc= require.isBrowser && document,
    element= doc && doc.createElement("DiV"),
    cache= [];

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
		"dojo-load-firebug-console": !!this["loadFirebugConsole"],// the firebug 2.0 console
  		"dojo-debug-messages": 1, // include dojo.deprecated/dojo.experimental implementations
  		"dojo-guarantee-console": 1,  // ensure that console.log, console.warn, etc. are defined
		"dojo-openAjax": typeof OpenAjax != "undefined", // register dojo with the OpenAjax hub
		"dojo-sniff-config": has("dom") ? 1 : 0,
		"dojo-v1x-i18n-Api": 1, // define the v1.x i18n functions 
		"dojo-test-sniff": 1,
		"loader-priority-addOnLoad": 0, // explicitly define the priority ready queue 
		"bug-for-in-skips-shadowed": function() {
			// does the javascript implementation skip properties that exist in Object's prototype (IE 6 - ?)
			for(var i in {toString: 1}){
				return 0;
			}
			return 1;
		},
		"native-xhr": typeof XMLHttpRequest != "undefined", // does the environment have a native XHR implementation
  });

  if(require.vendor=="dojotoolkit.org"){
    var p, i, requireHas= require.has;
    for(p in requireHas){
      cache[p]= requireHas(p);
    }
    for(i= 0; i<requireHas.length||0; i++){
      cache[i]= requireHas[i];
    }
  }
  return has;
});
