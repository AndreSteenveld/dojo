console.log("here");
require(["dojo", "dojo/has"], function(dojo, has) {
console.log("here");
  console.log("dojo loaded...");
  console.log("dojo contents:");
  for (var p in dojo) {
    if (dojo.isFunction(dojo[p])) {
      console.log(p + ": function");
    } else {
      console.log(p + ": " + dojo[p]);
    }
  }
  console.log("has contents:");
  for (p in has.cache) {
    console.log(p + ": " + has(p));
  }
});