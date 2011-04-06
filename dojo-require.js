define(["dojo", "./text"], function(dojo, textPlugin){
	if(dojo.require){
		// just use existing dojo.require
		return {
			load: function(id, parentRequire, loaded, config){
				loaded(dojo.require(id));
			}
		};
	}
	dojo.require = function(){
	};
	dojo.provide = function(id){
		dojo.getObject(id, true);
	};
	var modules = {};
	return {
		load: function(id, parentRequire, loaded, config){
			textPlugin.load(id.replace(/\./g, '/') + ".js", parentRequire, function(text){
				var deps = 0, done;
				var commentFree = text.replace(/\/\*[\s\S]*?\*\//g, '');
				if(!/dojo\.provide\s*\(\s*['"]([^'"]*)['"]\s*\)/.test(commentFree)){
					// doesn't look like a dojo module after all, revert back to script loading (hopefully the request should be cached)
					return parentRequire([id.replace(/\./g, '/')], function(modules){
						loaded(modules[0]);
					});
				}
				addDependencies(/dojo\.require\s*\(\s*['"]([^'"]*)['"]\s*\)/g, function(moduleId, loaded){
					parentRequire(["dojo/dojo-require!" + moduleId], loaded);
				});
/*						addDependencies(/dojo\.cache/g, function(loaded){
							require(["text!" + moduleId], loaded);
						});*/
				done = true;
				if(deps == 0){
					ready();
				}
				function addDependencies(regex, handler){
					commentFree.replace(regex, function(t, moduleId){
						deps++;
						handler(moduleId, function(){
							deps--;
							if(done && deps == 0){
								ready();
							}
						});
					});					
				}
				function ready(){
					eval(text + "\r\n//@ sourceURL=" + id);
					loaded(dojo.getObject(id));
				}
			});
		}
	};
});