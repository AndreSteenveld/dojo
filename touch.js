define(["./_base/kernel", "./listen"], function(dojo, listen){ 
         var eventMap = { 
                 "press": dojo.isTouchDevice ? "touchstart": "mousedown", 
                 "move": dojo.isTouchDevice ? "touchmove": "mousemove", 
                 "release": dojo.isTouchDevice ? "touchend": "mouseup" 
         }; 
         var _handle = function (/*String - press | move | release*/type){ 
                 return function(node, listener){//called by listen(), see dojo.listen 
                         return listen(node, type, listener); 
                 }; 
         }; 
         //device neutral events - dojo.touch.press|move|release 
         return { 
                 press: _handle(eventMap['press']), 
                 move: _handle(eventMap['move']), 
                 release: _handle(eventMap['release']) 
         }; 
 }); 