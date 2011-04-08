define(["./_base/kernel", "./_base/NodeList", "./has","./selector/_loader", "./selector/_loader!default"], 
		function(dojo, NodeList, has, loader, defaultEngine){
// summary:
// 		This modules gets the query engine and wraps it's results with a NodeList
"use strict";
function queryForEngine(engine){
	var query = function(/*String*/ query, /*String|DOMNode?*/ root){
		//	summary:
		//		Returns nodes which match the given CSS selector, searching the
		//		entire document by default but optionally taking a node to scope
		//		the search by. Returns an instance of dojo.NodeList.
		if(typeof root == "string"){
			root = dojo.byId(root);
			if(!root){
				return NodeList._wrap([]);
			}
		}
		var results = typeof query == "string" ? engine(query, root) : query.orphan ? query : [query];
		if(!(results instanceof Array)){
			// let selector engines directly return DOM NodeLists, we will convert them to arrays here if necessary 
			var array = [];
			for(var i = 0, l = results.length; i < l; i++){
				array.push(results[i]);
			}
			results = array;
		}else if(results.orphan){
			// already wrapped
			return results; 
		}
		return NodeList._wrap(results);
	};
	query.matches = engine.match || function(node, selector, root){
		// summary:
		//		Test to see if a node matches a selector
		return query.filter([node], selector, root).length > 0;
	};
	// the engine provides a filtering function, use it to for matching
	query.filter = engine.filter || function(nodes, selector, root){
		// summary:
		//		Filters an array of nodes. Note that this does not guarantee to return a dojo.NodeList, just an array.
		return query(selector, root).filter(function(node){
			return dojo.indexOf(nodes, node) > -1;
		});
	};
	query.setEngine = function(newEngine){
		// replace parent engine
		engine = typeof newEngine == "function" ? newEngine : function(selector, root){
			// Slick does it backwards
			return newEngine.search(root || document, selector);
		};
		if(engine.filter){
			query.filter = engine.filter;
		}
		if(engine.match){
			query.matches = engine.match;
		}
		return queryForEngine(engine);
	}
	return query;
};
var query = dojo.query = queryForEngine(defaultEngine);

query.load = function(id, parentRequire, loaded, config){
	// can be used a AMD plugin to conditionally load new query engine
	loader.load(id, parentRequire, function(engine){
		loaded(query.setEngine(engine));
	});
};
dojo._filterQueryResult = function(nodes, selector, root){
	return NodeList._wrap(query.filter(nodes, selector, root));
};
return query;
});
