(function(){
  // TODO bootstrap tests
	//dojo.require("tests._base._loader.bootstrap");
  // 
  // TODO loader tests
	//dojo.require("tests._base._loader.loader");
  // 
  // TODO platform boot tests
	//dojo.platformRequire({
	//  browser: ["tests._base._loader.hostenv_browser"],
	//  rhino: ["tests._base._loader.hostenv_rhino"],
	//  spidermonkey: ["tests._base._loader.hostenv_spidermonkey"]
	//});

  var deps= [
    "dojo/tests/_base/array"
    ,"dojo/tests/_base/Color"
    ,"dojo/tests/_base/lang"
    ,"dojo/tests/_base/declare"
    ,"dojo/tests/_base/connect"
    ,"dojo/tests/_base/Deferred"
    ,"dojo/tests/_base/json"
    ,"dojo/tests/_base/object"
  ];
  if(require.isBrowser){
    deps= deps.concat([
      "dojo/tests/_base/html"
      ,"dojo/tests/_base/fx"
      ,"dojo/tests/_base/query"
      ,"dojo/tests/_base/xhr"
      ,"dojo/tests/_base/window"
    ]);
  }
  define(deps, 1);
})();
