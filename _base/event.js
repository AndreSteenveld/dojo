define(["./kernel", "../listen", "./keypress"], function(dojo, listen, keypress){
	function has(feature){
		return {
			"dom-addeventlistener": document.addEventListener 
		}[feature];
	}
	if(listen._fixEvent){
		var fixEvent = listen._fixEvent;
		listen._fixEvent = function(evt){
			// add some additional normalization for back-compat, this isn't in listen.js because it is somewhat more expensive
			evt = fixEvent(evt);
			// FIXME: scroll position query is duped from dojo.html to
			// avoid dependency on that entire module. Now that HTML is in
			// Base, we should convert back to something similar there.
			var doc = (se && se.ownerDocument) || document;
			// DO NOT replace the following to use dojo.body(), in IE, document.documentElement should be used
			// here rather than document.body
			var docBody = ((dojo.isIE < 6) || (doc["compatMode"] == "BackCompat")) ? doc.body : doc.documentElement;
			var offset = dojo._getIeDocumentElementOffset();
			evt.pageX = evt.clientX + dojo._fixIeBiDiScrollLeft(docBody.scrollLeft || 0) - offset.x;
			evt.pageY = evt.clientY + (docBody.scrollTop || 0) - offset.y;
			return evt;
		};		
	}
	dojo.fixEvent = function(/*Event*/ evt, /*DOMNode*/ sender){
		// summary:
		//		normalizes properties on the event object including event
		//		bubbling methods, keystroke normalization, and x/y positions
		// evt: Event
		//		native event object
		// sender: DOMNode
		//		node to treat as "currentTarget"
		if(listen._fixEvent){
			return listen._fixEvent(evt, sender);
		}
/*		TODO: Fix this
 * if(evt.type == "keydown" || evt.type == "keypress"){
			return keypress.fixEvent(evt);
		}*/
		return evt;
	};
	
	dojo.stopEvent = has("dom-addeventlistener") ? function(/*Event*/ evt){
		// summary:
		//		prevents propagation and clobbers the default action of the
		//		passed event
		// evt: Event
		//		The event object. If omitted, window.event is used on IE.
		evt.preventDefault();
		evt.stopPropagation();
		// NOTE: below, this method is overridden for IE
	} : function(evt){
		evt = evt || window.event;
		evt.cancelBubble = true;
		listen._preventDefault.call(evt);
	};
});
