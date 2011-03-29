define("dojo/mouse", ["dojo/lib/kernel", "dojo/listen"], function(dojo, listen){
	function has(feature){
		return {
			"dom-quirks": document.compatMode == "BackCompat",
			"dom-addeventlistener": document.addEventListener
		}[feature];
	}
	var mouseButtons;
	if(has("dom-quirks") && !has("dom-addeventlistener")){
		mouseButtons = {
			LEFT:   1,
			MIDDLE: 4,
			RIGHT:  2,
			// helper functions
			isButton: function(e, button){ return e.button & button; },
			isLeft:   function(e){ return e.button & 1; },
			isMiddle: function(e){ return e.button & 4; },
			isRight:  function(e){ return e.button & 2; }
		};
	}else{
		mouseButtons = {
			LEFT:   0,
			MIDDLE: 1,
			RIGHT:  2,
			// helper functions
			isButton: function(e, button){ return e.button == button; },
			isLeft:   function(e){ return e.button == 0; },
			isMiddle: function(e){ return e.button == 1; },
			isRight:  function(e){ return e.button == 2; }
		};
	}
	function eventRedirect(type, callback){
		return function(node, listener){
			return listen(node, type, function(evt){
				return callback(node, evt, listener);
			});
		}
	}
	dojo.mouseButtons = mouseButtons;

/*=====
	dojo.mouseButtons = {
		// LEFT: Number
		//		Numeric value of the left mouse button for the platform.
		LEFT:   0,
		// MIDDLE: Number
		//		Numeric value of the middle mouse button for the platform.
		MIDDLE: 1,
		// RIGHT: Number
		//		Numeric value of the right mouse button for the platform.
		RIGHT:  2,
	
		isButton: function(e, button){
			// summary:
			//		Checks an event object for a pressed button
			// e: Event
			//		Event object to examine
			// button: Number
			//		The button value (example: dojo.mouseButton.LEFT)
			return e.button == button; // Boolean
		},
		isLeft: function(e){
			// summary:
			//		Checks an event object for the pressed left button
			// e: Event
			//		Event object to examine
			return e.button == 0; // Boolean
		},
		isMiddle: function(e){
			// summary:
			//		Checks an event object for the pressed middle button
			// e: Event
			//		Event object to examine
			return e.button == 1; // Boolean
		},
		isRight: function(e){
			// summary:
			//		Checks an event object for the pressed right button
			// e: Event
			//		Event object to examine
			return e.button == 2; // Boolean
		}
	};
=====*/
	function has(feature){
		return {
			"events-mouseenter": "onmouseenter" in document
		}[feature];
	}
	if(has("events-mouseenter")){
		var eventHandler = function(type){
			return function(node, listener){
				return listen(node, type, listener);
			};
		};
		return {
			enter: eventHandler("mouseenter"),
			leave: eventHandler("mouseleave") 
		};
	}
	else{
		var eventHandler = function(type){
			return function(node, listener){
				return listen(node, type, function(evt){
					if(!dojo.isDescendant(evt.relatedTarget, node)){
						return listener.call(this, evt);
					}					
				});
			};
		};
		return {
			enter: eventHandler("mouseover"),
			leave: eventHandler("mouseout")
		};
	}
});
