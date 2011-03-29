define("dojo/aspect",[], function(){
/*
 * AOP Advice
 * Use this to add "before" or "after" advice to methods. For examples:
 * var aspect = require("pckg/aspect");
 * var signal = aspect.after(targetObject, "methodName", function(someArgument){
 *	 // this will be called when targetObject.methodName() is called, after the original function is called
 * }, true); // receive the arguments
 * 
 * signal.pause(); // this will pause the advice from being executed
 * signal.resume(); // this will resume the advice being executed
 * signal.cancel(); // this will cancel the advice from being executed
 * 
 * aspect.before(targetObject, "methodName", function(someArgument){
 *	 // this will be called when targetObject.methodName() is called, before the original function is called
 * });

 */
 	"use strict";
	var undef;
	function advise(dispatcher, type, advice, receiveArguments){
		var previous = dispatcher[type];
		var around = type == "around";
		if(around){
			var advised = advice(function(){
				return previous.advice(this, arguments);
			});
			var signal = {
				cancel: function(){
					signal.cancelled = true;
				},
				advice: function(target, args){
					return signal.cancelled ?
						previous.advice(target, args) : // cancelled, skip to next one
						advised.apply(target, args);	// called the advised function
				}
			};
		}else{
			// create the cancel handler
			var signal = {
				cancel: function(){
					var previous = signal.previous;
					var next = signal.next;
					if(!next && !previous){
						delete dispatcher[type];
					}else{
						if(previous){
							previous.next = next;
						}else{
							dispatcher[type] = next;
						}
						if(next){
							next.previous = previous;
						}
					}
				},
				advice: advice,
				receiveArguments: receiveArguments
			};
		}
		if(previous && !around){
			if(type == "after"){
				// add the listener to the end of the list
				var next = previous;
				while(next){
					previous = next;
					next = next.next;
				}
				previous.next = signal;
				signal.previous = previous;
			}else if(type == "before"){
				// add to beginning
				dispatcher[type] = signal;
				signal.next = previous;
				previous.previous = signal;
			}
		}else{
			// around or first one just replaces
			dispatcher[type] = signal;
		}
		return signal;
	}
	function aspect(type){
		return function(target, methodName, advice, receiveArguments){
			var existing = target[methodName], dispatcher;
			if(!existing || !existing.around){
				// no dispatcher in place
				dispatcher = target[methodName] = function(){
					// before advice
					var args = arguments;
					var before = dispatcher.before;
					while(before){
						args = before.advice.apply(this, args) || args;
						before = before.next;
					}
					// around advice 
					var results = dispatcher.around ? dispatcher.around.advice(this, args) : args;
					// after advice
					var after = dispatcher.after;
					while(after){
						results = after.receiveArguments ? after.advice.apply(this, args) || results :
								after.advice.call(this, results);
						after = after.next;
					}
					return results;
				};
				target = null; // make sure we don't have cycles for IE
				existing && (dispatcher.around = {advice: function(target, args){
					return existing.apply(target, args);
				}});
			}
			return advise((dispatcher || existing), type, advice, receiveArguments);
		};
	}
	return {
		before: aspect("before"),
		around: aspect("around"),
		after: aspect("after")
	};
});