define([
  "./_base/kernel",
  "./has",
  "./_base/load",
  "./_base/loader",
  "./_base/lang",
  "./_base/array",
  "./_base/declare",
  "./_base/connect",
  "./_base/Deferred",
  "./_base/json",
  "./_base/Color",
  "./has!host-browser!./_base/browser"], function(dojo, has){
  //  module:
  //    dojo/main
  //  summary:
  //    This is the package main module for the dojo package; it loads dojo base appropriate for the execution environment.

  if(dojo.isArray(dojo.config.require)){
    if(dojo.isAsync()){
      require(dojo.config.require);
    }else{
      dojo.forEach(dojo.config.require, function(i){
  	    dojo["require"](i);
      });
    }
  }
  return dojo;
});
