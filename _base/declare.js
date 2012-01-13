define(["./kernel", "compose/compose", "./lang"], function(dojo, Compose, lang){
	// module:
	//		dojo/_base/declare
	// summary:
	//		This module defines dojo.declare.

	function inherited(args, replacementArguments){
		// get the inherited function and call it
		return this.getInherited(args).apply(this, replacementArguments || args);
	}
	function getInherited(args){
		// get the inherited overriden method
		var prototypes = this.constructor._getBases(true);
		var callee = args.callee;
		var nameOfCallee = callee.nom;
		if(!nameOfCallee){
			// put names on all the methods
			for(var i in this){
				var method = this[i];
				if(typeof method == "function"){
					method.nom = i;
				}
			}
			nameOfCallee = callee.nom;
		}
		// check to see if we are the |this|'s function before we even get into the prototypes
		var next = this[nameOfCallee] == callee;
		for(var i = prototypes.length-1; i >= 0;i--){
			// search through all the prototypes, trying to find ourself and then to find the method after ourself
			var prototype = prototypes[i];
			var prototypeMethod = prototype.hasOwnProperty(nameOfCallee) && prototype[nameOfCallee];
			if(prototypeMethod == callee){
				next = true;
			}else if(next && prototypeMethod){
				prototypeMethod.nom = nameOfCallee;
				return prototypeMethod /*prototype[/*name ||  nameOfCallee]*/; 
			}
		}
		throw new Error("No inherited method to call");
	}
	function safeMixin(target, source){
		if(source.hasOwnProperty("constructor")){
			source._constructor = Compose.after(source.constructor);
		}
		if(source.preamble){
			source.preamble = Compose.after(source.preamble);
		}
		Compose.call(target, source);
	}
	function lifecycle(){
		// the shaman's ritual, simplified, we make this a super constructor of everything we made
		this.preamble && this.preamble.apply(this, arguments);
		this._constructor && this._constructor.apply(this, arguments);
		this.postscript && this.postscript.apply(this, arguments);
	}
	function declare(namespace, bases, prototype){
		if(typeof namespace != "string"){
			// shift if the namespace is missing
			prototype = bases;
			bases = namespace;
			namespace = null;
		}
		prototype = prototype || {};
		// normalize bases to an array
		bases = bases || [];
		if(!(bases instanceof Array)){
			bases = [bases];
		}
		var superclass = bases[0];
		var hasLifecycleConstructor;
		// check to see if we have already inserted our constructor
		for(var i = 0;i < bases.length; i++){
			var basePrototype = bases[i].prototype; 
			if(basePrototype.inherited){
				hasLifecycleConstructor = true;
			}
		}
		if(prototype.hasOwnProperty("constructor")){
			prototype._constructor = Compose.after(prototype.constructor);
		}
		if(prototype.preamble){
			prototype.preamble = Compose.after(prototype.preamble);
		}
		if(!hasLifecycleConstructor){
			// add the declare lifecycle constructor
			bases.unshift(lifecycle);
		}
		bases.push(prototype);
		// ready to hand over to compose
		var clazz = declare.apply.call(Compose, 0, bases);
		// record the properties that dojo.declare creates
		clazz.superclass = superclass && superclass.prototype;
		if(!clazz.prototype.inherited){
			// make it have the inherited and getInherited function
			clazz.prototype.inherited = inherited;
			clazz.prototype.getInherited = getInherited;
		}
		if(namespace){
			// if namespace is provided, create the class in that namespace
			clazz.declaredClass = namespace;
			clazz.prototype.declaredClass = namespace;
			lang.setObject(namespace, clazz);
		}
		return clazz;
	}
	/*=====
	dojo.declare = function(className, superclass, props){
		//	summary:
		//		Create a feature-rich constructor from compact notation.
		//	className: String?:
		//		The optional name of the constructor (loosely, a "class")
		//		stored in the "declaredClass" property in the created prototype.
		//		It will be used as a global name for a created constructor.
		//	superclass: Function|Function[]:
		//		May be null, a Function, or an Array of Functions. This argument
		//		specifies a list of bases (the left-most one is the most deepest
		//		base).
		//	props: Object:
		//		An object whose properties are copied to the created prototype.
		//		Add an instance-initialization function by making it a property
		//		named "constructor".
		//	returns:
		//		New constructor function.
		//	description:
		//		Create a constructor using a compact notation for inheritance and
		//		prototype extension.
		//
		//		Mixin ancestors provide a type of multiple inheritance.
		//		Prototypes of mixin ancestors are copied to the new class:
		//		changes to mixin prototypes will not affect classes to which
		//		they have been mixed in.
		//
		//		Ancestors can be compound classes created by this version of
		//		dojo.declare. In complex cases all base classes are going to be
		//		linearized according to C3 MRO algorithm
		//		(see http://www.python.org/download/releases/2.3/mro/ for more
		//		details).
		//
		//		"className" is cached in "declaredClass" property of the new class,
		//		if it was supplied. The immediate super class will be cached in
		//		"superclass" property of the new class.
		//
		//		Methods in "props" will be copied and modified: "nom" property
		//		(the declared name of the method) will be added to all copied
		//		functions to help identify them for the internal machinery. Be
		//		very careful, while reusing methods: if you use the same
		//		function under different names, it can produce errors in some
		//		cases.
		//
		//		It is possible to use constructors created "manually" (without
		//		dojo.declare) as bases. They will be called as usual during the
		//		creation of an instance, their methods will be chained, and even
		//		called by "this.inherited()".
		//
		//		Special property "-chains-" governs how to chain methods. It is
		//		a dictionary, which uses method names as keys, and hint strings
		//		as values. If a hint string is "after", this method will be
		//		called after methods of its base classes. If a hint string is
		//		"before", this method will be called before methods of its base
		//		classes.
		//
		//		If "constructor" is not mentioned in "-chains-" property, it will
		//		be chained using the legacy mode: using "after" chaining,
		//		calling preamble() method before each constructor, if available,
		//		and calling postscript() after all constructors were executed.
		//		If the hint is "after", it is chained as a regular method, but
		//		postscript() will be called after the chain of constructors.
		//		"constructor" cannot be chained "before", but it allows
		//		a special hint string: "manual", which means that constructors
		//		are not going to be chained in any way, and programmer will call
		//		them manually using this.inherited(). In the latter case
		//		postscript() will be called after the construction.
		//
		//		All chaining hints are "inherited" from base classes and
		//		potentially can be overridden. Be very careful when overriding
		//		hints! Make sure that all chained methods can work in a proposed
		//		manner of chaining.
		//
		//		Once a method was chained, it is impossible to unchain it. The
		//		only exception is "constructor". You don't need to define a
		//		method in order to supply a chaining hint.
		//
		//		If a method is chained, it cannot use this.inherited() because
		//		all other methods in the hierarchy will be called automatically.
		//
		//		Usually constructors and initializers of any kind are chained
		//		using "after" and destructors of any kind are chained as
		//		"before". Note that chaining assumes that chained methods do not
		//		return any value: any returned value will be discarded.
		//
		//	example:
		//	|	dojo.declare("my.classes.bar", my.classes.foo, {
		//	|		// properties to be added to the class prototype
		//	|		someValue: 2,
		//	|		// initialization function
		//	|		constructor: function(){
		//	|			this.myComplicatedObject = new ReallyComplicatedObject();
		//	|		},
		//	|		// other functions
		//	|		someMethod: function(){
		//	|			doStuff();
		//	|		}
		//	|	});
		//
		//	example:
		//	|	var MyBase = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyClass1 = dojo.declare(MyBase, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyClass2 = dojo.declare(MyBase, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var MyDiamond = dojo.declare([MyClass1, MyClass2], {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//
		//	example:
		//	|	var F = function(){ console.log("raw constructor"); };
		//	|	F.prototype.method = function(){
		//	|		console.log("raw method");
		//	|	};
		//	|	var A = dojo.declare(F, {
		//	|		constructor: function(){
		//	|			console.log("A.constructor");
		//	|		},
		//	|		method: function(){
		//	|			console.log("before calling F.method...");
		//	|			this.inherited(arguments);
		//	|			console.log("...back in A");
		//	|		}
		//	|	});
		//	|	new A().method();
		//	|	// will print:
		//	|	// raw constructor
		//	|	// A.constructor
		//	|	// before calling F.method...
		//	|	// raw method
		//	|	// ...back in A
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		"-chains-": {
		//	|			destroy: "before"
		//	|		}
		//	|	});
		//	|	var B = dojo.declare(A, {
		//	|		constructor: function(){
		//	|			console.log("B.constructor");
		//	|		},
		//	|		destroy: function(){
		//	|			console.log("B.destroy");
		//	|		}
		//	|	});
		//	|	var C = dojo.declare(B, {
		//	|		constructor: function(){
		//	|			console.log("C.constructor");
		//	|		},
		//	|		destroy: function(){
		//	|			console.log("C.destroy");
		//	|		}
		//	|	});
		//	|	new C().destroy();
		//	|	// prints:
		//	|	// B.constructor
		//	|	// C.constructor
		//	|	// C.destroy
		//	|	// B.destroy
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		"-chains-": {
		//	|			constructor: "manual"
		//	|		}
		//	|	});
		//	|	var B = dojo.declare(A, {
		//	|		constructor: function(){
		//	|			// ...
		//	|			// call the base constructor with new parameters
		//	|			this.inherited(arguments, [1, 2, 3]);
		//	|			// ...
		//	|		}
		//	|	});
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		"-chains-": {
		//	|			m1: "before"
		//	|		},
		//	|		m1: function(){
		//	|			console.log("A.m1");
		//	|		},
		//	|		m2: function(){
		//	|			console.log("A.m2");
		//	|		}
		//	|	});
		//	|	var B = dojo.declare(A, {
		//	|		"-chains-": {
		//	|			m2: "after"
		//	|		},
		//	|		m1: function(){
		//	|			console.log("B.m1");
		//	|		},
		//	|		m2: function(){
		//	|			console.log("B.m2");
		//	|		}
		//	|	});
		//	|	var x = new B();
		//	|	x.m1();
		//	|	// prints:
		//	|	// B.m1
		//	|	// A.m1
		//	|	x.m2();
		//	|	// prints:
		//	|	// A.m2
		//	|	// B.m2
		return new Function(); // Function
	};
	=====*/

	/*=====
	dojo.safeMixin = function(target, source){
		//	summary:
		//		Mix in properties skipping a constructor and decorating functions
		//		like it is done by dojo.declare.
		//	target: Object
		//		Target object to accept new properties.
		//	source: Object
		//		Source object for new properties.
		//	description:
		//		This function is used to mix in properties like lang.mixin does,
		//		but it skips a constructor property and decorates functions like
		//		dojo.declare does.
		//
		//		It is meant to be used with classes and objects produced with
		//		dojo.declare. Functions mixed in with dojo.safeMixin can use
		//		this.inherited() like normal methods.
		//
		//		This function is used to implement extend() method of a constructor
		//		produced with dojo.declare().
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		m1: function(){
		//	|			console.log("A.m1");
		//	|		},
		//	|		m2: function(){
		//	|			console.log("A.m2");
		//	|		}
		//	|	});
		//	|	var B = dojo.declare(A, {
		//	|		m1: function(){
		//	|			this.inherited(arguments);
		//	|			console.log("B.m1");
		//	|		}
		//	|	});
		//	|	B.extend({
		//	|		m2: function(){
		//	|			this.inherited(arguments);
		//	|			console.log("B.m2");
		//	|		}
		//	|	});
		//	|	var x = new B();
		//	|	dojo.safeMixin(x, {
		//	|		m1: function(){
		//	|			this.inherited(arguments);
		//	|			console.log("X.m1");
		//	|		},
		//	|		m2: function(){
		//	|			this.inherited(arguments);
		//	|			console.log("X.m2");
		//	|		}
		//	|	});
		//	|	x.m2();
		//	|	// prints:
		//	|	// A.m1
		//	|	// B.m1
		//	|	// X.m1
	};
	=====*/

	/*=====
	Object.inherited = function(name, args, newArgs){
		//	summary:
		//		Calls a super method.
		//	name: String?
		//		The optional method name. Should be the same as the caller's
		//		name. Usually "name" is specified in complex dynamic cases, when
		//		the calling method was dynamically added, undecorated by
		//		dojo.declare, and it cannot be determined.
		//	args: Arguments
		//		The caller supply this argument, which should be the original
		//		"arguments".
		//	newArgs: Object?
		//		If "true", the found function will be returned without
		//		executing it.
		//		If Array, it will be used to call a super method. Otherwise
		//		"args" will be used.
		//	returns:
		//		Whatever is returned by a super method, or a super method itself,
		//		if "true" was specified as newArgs.
		//	description:
		//		This method is used inside method of classes produced with
		//		dojo.declare to call a super method (next in the chain). It is
		//		used for manually controlled chaining. Consider using the regular
		//		chaining, because it is faster. Use "this.inherited()" only in
		//		complex cases.
		//
		//		This method cannot me called from automatically chained
		//		constructors including the case of a special (legacy)
		//		constructor chaining. It cannot be called from chained methods.
		//
		//		If "this.inherited()" cannot find the next-in-chain method, it
		//		does nothing and returns "undefined". The last method in chain
		//		can be a default method implemented in Object, which will be
		//		called last.
		//
		//		If "name" is specified, it is assumed that the method that
		//		received "args" is the parent method for this call. It is looked
		//		up in the chain list and if it is found the next-in-chain method
		//		is called. If it is not found, the first-in-chain method is
		//		called.
		//
		//		If "name" is not specified, it will be derived from the calling
		//		method (using a methoid property "nom").
		//
		//	example:
		//	|	var B = dojo.declare(A, {
		//	|		method1: function(a, b, c){
		//	|			this.inherited(arguments);
		//	|		},
		//	|		method2: function(a, b){
		//	|			return this.inherited(arguments, [a + b]);
		//	|		}
		//	|	});
		//	|	// next method is not in the chain list because it is added
		//	|	// manually after the class was created.
		//	|	B.prototype.method3 = function(){
		//	|		console.log("This is a dynamically-added method.");
		//	|		this.inherited("method3", arguments);
		//	|	};
		//	example:
		//	|	var B = dojo.declare(A, {
		//	|		method: function(a, b){
		//	|			var super = this.inherited(arguments, true);
		//	|			// ...
		//	|			if(!super){
		//	|				console.log("there is no super method");
		//	|				return 0;
		//	|			}
		//	|			return super.apply(this, arguments);
		//	|		}
		//	|	});
		return	{};	// Object
	}
	=====*/

	/*=====
	Object.getInherited = function(name, args){
		//	summary:
		//		Returns a super method.
		//	name: String?
		//		The optional method name. Should be the same as the caller's
		//		name. Usually "name" is specified in complex dynamic cases, when
		//		the calling method was dynamically added, undecorated by
		//		dojo.declare, and it cannot be determined.
		//	args: Arguments
		//		The caller supply this argument, which should be the original
		//		"arguments".
		//	returns:
		//		Returns a super method (Function) or "undefined".
		//	description:
		//		This method is a convenience method for "this.inherited()".
		//		It uses the same algorithm but instead of executing a super
		//		method, it returns it, or "undefined" if not found.
		//
		//	example:
		//	|	var B = dojo.declare(A, {
		//	|		method: function(a, b){
		//	|			var super = this.getInherited(arguments);
		//	|			// ...
		//	|			if(!super){
		//	|				console.log("there is no super method");
		//	|				return 0;
		//	|			}
		//	|			return super.apply(this, arguments);
		//	|		}
		//	|	});
		return	{};	// Object
	}
	=====*/

	/*=====
	Object.isInstanceOf = function(cls){
		//	summary:
		//		Checks the inheritance chain to see if it is inherited from this
		//		class.
		//	cls: Function
		//		Class constructor.
		//	returns:
		//		"true", if this object is inherited from this class, "false"
		//		otherwise.
		//	description:
		//		This method is used with instances of classes produced with
		//		dojo.declare to determine of they support a certain interface or
		//		not. It models "instanceof" operator.
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var B = dojo.declare(null, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var C = dojo.declare([A, B], {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|	var D = dojo.declare(A, {
		//	|		// constructor, properties, and methods go here
		//	|		// ...
		//	|	});
		//	|
		//	|	var a = new A(), b = new B(), c = new C(), d = new D();
		//	|
		//	|	console.log(a.isInstanceOf(A)); // true
		//	|	console.log(b.isInstanceOf(A)); // false
		//	|	console.log(c.isInstanceOf(A)); // true
		//	|	console.log(d.isInstanceOf(A)); // true
		//	|
		//	|	console.log(a.isInstanceOf(B)); // false
		//	|	console.log(b.isInstanceOf(B)); // true
		//	|	console.log(c.isInstanceOf(B)); // true
		//	|	console.log(d.isInstanceOf(B)); // false
		//	|
		//	|	console.log(a.isInstanceOf(C)); // false
		//	|	console.log(b.isInstanceOf(C)); // false
		//	|	console.log(c.isInstanceOf(C)); // true
		//	|	console.log(d.isInstanceOf(C)); // false
		//	|
		//	|	console.log(a.isInstanceOf(D)); // false
		//	|	console.log(b.isInstanceOf(D)); // false
		//	|	console.log(c.isInstanceOf(D)); // false
		//	|	console.log(d.isInstanceOf(D)); // true
		return	{};	// Object
	}
	=====*/

	/*=====
	Object.extend = function(source){
		//	summary:
		//		Adds all properties and methods of source to constructor's
		//		prototype, making them available to all instances created with
		//		constructor. This method is specific to constructors created with
		//		dojo.declare.
		//	source: Object
		//		Source object which properties are going to be copied to the
		//		constructor's prototype.
		//	description:
		//		Adds source properties to the constructor's prototype. It can
		//		override existing properties.
		//
		//		This method is similar to dojo.extend function, but it is specific
		//		to constructors produced by dojo.declare. It is implemented
		//		using dojo.safeMixin, and it skips a constructor property,
		//		and properly decorates copied functions.
		//
		//	example:
		//	|	var A = dojo.declare(null, {
		//	|		m1: function(){},
		//	|		s1: "Popokatepetl"
		//	|	});
		//	|	A.extend({
		//	|		m1: function(){},
		//	|		m2: function(){},
		//	|		f1: true,
		//	|		d1: 42
		//	|	});
	};
	=====*/

	dojo.safeMixin = declare.safeMixin = safeMixin;
	dojo.declare = declare;

	return declare;
});
