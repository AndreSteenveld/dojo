define(["dojo", "dijit", "dojox", "dojo/tests/_base/loader/c_xd"], function(dojo, dijit, dojox) {
// begin original module content
dojo.provide("dojo.tests._base.loader.d_xd");
dojo.require("dojo.tests._base.loader.c_xd");
dojo.mixin(dojo.tests._base.loader.d_xd, {name:"d", c:dojo.tests._base.loader.c_xd});
// end
return dojo.require("dojo.tests._base.loader.d_xd");
});

