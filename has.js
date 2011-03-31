define("dojo/has", [], function(){
	// summary: A simple feature detection function/framework.
	//
	// name: String
	//	  The name of the feature to detect, as defined by the overall `has` tests.
	//	  Tests can be registered via `has.add(testname, testfunction)`.
	//
	// example:
	//	  mylibrary.bind = has("native-bind") ? function(fn, context){
	//		  return fn.bind(context);
	//	  } : function(fn, context){
	//		  return function(){
	//			  fn.apply(context, arguments);
	//		  }
	//	  }
	
	var /* Not including the full has.js arguments unless we are sure we need it
		NON_HOST_TYPES = { "boolean": 1, "number": 1, "string": 1, "undefined": 1 },
		g = (function(){return this;})(),
		d = isHostType(g, "document") && g.document,
		el = d && isHostType(d, "createElement") && d.createElement("DiV"),*/
		testCache = {};

	function has(/* String */name){
		if(typeof testCache[name] == "function"){
			testCache[name] = testCache[name](/*g, d, el*/);
		}
		return testCache[name]; // boolean or scalar
	}
	
	// Host objects can return type values that are different from their actual
	// data type. The objects we are concerned with usually return non-primitive
	// types of object, function, or unknown.
	/*has.isHostType = function(object, property){
		var type = typeof object[property];
		return type == 'object' ? !!object[property] : !NON_HOST_TYPES[type];
	}*/
	
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
		//	  A redundant test, testFn with immediate execution:
		//  |	   has.add("javascript", function(){ return true; }, true);
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
			testCache[name] = test;
		}
	};
	// TODO: Should some common tests go in here like touch and device width?
	return has;

});
