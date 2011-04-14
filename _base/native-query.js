define([], function(){
	// native QSA with speed-ups where possible, taken from Sizzle
	return {
		search: function(query, context){
			// See if we find a selector to speed up
			var match = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec( query );
			context = context || document;
			
			if ( match && (context.nodeType === 1 || context.nodeType === 9) ) {
				// Speed-up: TAG
				if ( match[1] ) {
					return context.getElementsByTagName( query );
				
				// Speed-up: .CLASS
				} else if ( match[2] && Expr.find.CLASS && context.getElementsByClassName ) {
					return context.getElementsByClassName( match[2] );
				}
			}
			
			if ( context.nodeType === 9 ) {
				// Speed-up: body
				// The body element only exists once, optimize finding it
				if ( query === "body" && context.body ) {
					return [ context.body ];
					
				// Speed-up: #ID
				} else if ( match && match[3] ) {
					var elem = context.getElementById( match[3] );

					// Check parentNode to catch when Blackberry 4.6 returns
					// nodes that are no longer in the document #6963
					if ( elem && elem.parentNode ) {
						// Handle the case where IE and Opera return items
						// by name instead of ID
						if ( elem.id === match[3] ) {
							return [ elem ];
						}
						
					} else {
						return [];
					}
				}
				
				return context.querySelectorAll(query);

			// qSA works strangely on Element-rooted queries
			// We can work around this by specifying an extra ID on the root
			// and working up from there (Thanks to Andrew Dupont for the technique)
			// IE 8 doesn't work on object elements
			} else if ( context.nodeType === 1 && context.nodeName.toLowerCase() !== "object" ) {
				var oldContext = context,
					old = context.getAttribute( "id" ),
					nid = old || "__dojo__",
					hasParent = context.parentNode,
					relativeHierarchySelector = /^\s*[+~]/.test( query );

				if ( !old ) {
					context.setAttribute( "id", nid );
				} else {
					nid = nid.replace( /'/g, "\\$&" );
				}
				if ( relativeHierarchySelector && hasParent ) {
					context = context.parentNode;
				}

				try {
					if ( !relativeHierarchySelector || hasParent ) {
						return context.querySelectorAll( "[id='" + nid + "'] " + query );
					}

				} finally {
					if ( !old ) {
						oldContext.removeAttribute( "id" );
					}
				}
			}
		},
		match: function(node, selector){
			// it matches if the first item returned from a rooted selector call is the given node
			return context.querySelector(selector, node) == node;
		}
	};
});