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
      return cache[name] = cache[name](global, doc, element);
    }
    return cache[name]; // Boolean
  }

  has.cache= [];

  has.add= function(name, test, now){
    // summary: 
    //   Register a new feature test for some named feature.
    //
    // name: String|Integer
    //   The name (if a string) or identifier (if an integer) of the feature to test.
    //
    // test: Function
    //   A test function to register. If a function, queued for testing until actually
    //   needed. The test function should return a boolean indicating
    //   the presence of a feature or bug.
    //
    // now: Boolean?
    //   Optional. Omit if `test` is not a function. Provides a way to immediately
    //   run the test and cache the result.
    // 
    // example:
    //      A redundant test, testFn with immediate execution:
    //  |       has.add("javascript", function(){ return true; }, true);
    //
    // example:
    //      Again with the redundantness. You can do this in your tests, but we should
    //      not be doing this in any internal has.js tests
    //  |       has.add("javascript", true);
    //
    // example:
    //      Three things are passed to the testFunction. `global`, `document`, and a generic element
    //      from which to work your test should the need arise.
    //  |       has.add("bug-byid", function(g, d, el){
    //  |           // g  == global, typically window, yadda yadda
    //  |           // d  == document object
    //  |           // el == the generic element. a `has` element.
    //  |           return false; // fake test, byid-when-form-has-name-matching-an-id is slightly longer
    //  |       });

    cache[name] = now ? test(global, doc, element) : test;
  };

  has.clearElement= function(element) {
    element.innerHTML= "";
    return element;
  };

  var add= has.add;

  add("dojo-load-firebug-console", 
    // the firebug 2.0 console
    !!this["loadFirebugConsole"]
  );
  
  add("dojo-load-firebug-console", 
    // the firebug 2.0 console
    !!this["loadFirebugConsole"]
  );
  
  add("dojo-debug-messages", 
    // include dojo.deprecated/dojo.experimental implementations
    1
  );

  add("dojo-guarantee-console", 
    // ensure that console.log, console.warn, etc. are defined
    1
  );

  add("dojo-openAjax", 
    // register dojo with the OpenAjax hub
    typeof OpenAjax != "undefined"
  );

  add("dojo-sniff-config", 
    // inspect script elements for data-dojo-config during bootstrap
    has("dom") ? 1 : 0
  );

  add("dojo-v1x-i18n-Api", 
    // define the v1.x i18n functions
    1
  );

  add("dojo-test-sniff", 
    // TODOC
    1
  );

  add("loader-priority-addOnLoad", 
    // explicitly define the priority ready queue
    0
  );

  add("bug-for-in-skips-shadowed", function() {
    // does the javascript implementation skip properties that exist in Object's prototype (IE 6 - ?)
    for(var i in {toString: 1}){
      return 0;
    }
    return 1;
  });

  add("native-xhr", function() {
    // does the environment have a native XHR implementation
    return !!XMLHttpRequest;
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
