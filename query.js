(function(){
"use strict";
var features = {
	// if selector engine is explicitly specified, we use that one
	"config-selector-engine": window.dojo && dojo.config.selectorEngine,
	"dom-qsa": (function(){ 
			// test to see if we have a reasonable native selector engine available
			try{
				var div = document.createElement("div");
				div.innerHTML = "<p class='TEST'></p>"; // test kind of from sizzle
				// Safari can't handle uppercase or unicode characters when
				// in quirks mode, IE8 can't handle pseudos like :empty 
				return div.querySelectorAll(".TEST:empty").length == 1;
			}catch(e){}
		})()
}; 
function has(feature){
	return features[feature];
}
define("dojo/query", ["dojo/lib/kernel", "dojo/_base/NodeList", has("config-selector-engine") ? has("config-selector-engine") : has("dom-qsa") ? "dojo/selector/native-query" : "dojo/selector/Slick.Finder"], 
		function(dojo, NodeList, selectorEngine){	
	var query = dojo.query = function(/*String*/ query, /*String|DOMNode?*/ root){
		var results = selectorEngine.search(query, root);
		if(!(results instanceof Array)){
			// let selector engines directly return DOM NodeLists, we will convert them to arrays here if necessary 
			var array = [];
			for(var i = 0, l = results.length; i < l; i++){
				array.push(results[i]);
			}
			results = array;
		}
		return NodeList._wrap(results);
	};
	query.matches = function(node, selector, root){
		// TODO: if root is included, ensure an id and do a rooted CSS selector
		return selectorEngine.match(node, selector, root);
	};
	return query;
});
})();