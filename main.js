// AMD module id = dojo
//
// This is a package main module for the dojo package.
define([
  "./_base/kernel",
  "./_base/load",
  "./_base/loader",
  "./_base/lang",
  "./_base/array",
  "./_base/declare",
  "./_base/connect",
  "./_base/Deferred",
  "./_base/json",
  "./_base/Color"].concat(require.isBrowser ? [
    "./_base/sniff",
    "./_base/unload",
    "./_base/url",
    "./_base/window",
    "./_base/event",
    "./_base/html",
    "./_base/NodeList",
    "./_base/query",
    "./_base/xhr",
    "./_base/fx"
  ] : []), function(dojo){
  // if we have a clone API, use it to get an independent config object
  dojo.clone && (dojo.config= dojo.clone(dojo.config));
  return dojo;
});
