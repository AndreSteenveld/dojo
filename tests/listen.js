dojo.provide("tests.listen");

var listen = dojo.require("dojo.listen");
doh.register("tests.listen",
	[
		function object(t){
			var order = [];
			var obj = {
				oncustom: function(event){
					order.push(event.a);
					return event.a+1;
				}
			};
			var signal = listen.pausable(obj, "custom", function(event){
				order.push(0);
				return event.a+1;
			});
			obj.oncustom({a:0});
			var signal2 = listen(obj, "custom", function(event){
				order.push(event.a);
			});
			listen.dispatch(obj, {
				type:"custom",
				a: 3
			});
			signal.pause();
			var signal3 = listen(obj, "custom", function(a){
				order.push(3);
			}, true);
			listen.dispatch(obj, {
				type:"custom",
				a: 3
			});
			signal2.cancel();
			signal.resume();
			listen.dispatch(obj, {
				type:"custom",
				a: 6
			});
			signal3.cancel();
			var signal4 = listen(obj, "custom", function(a){
				order.push(4);
			}, true);
			signal.cancel();
			listen.dispatch(obj, {
				type:"custom",
				a: 7
			});
			t.is(order, [0,0,3,0,3,3,3,3,6,0,3,7,4]);
		},
		function dom(t){
			var div = document.body.appendChild(document.createElement("div"));
			var span = div.appendChild(document.createElement("span"));
			var order = [];
			var signal = listen(div,"custom", function(event){
				order.push(event.a);
			});
			listen.dispatch(div, {
				type:"custom",
				a: 0
			});
			listen.dispatch(div, {
				type:"otherevent",
				a: 0
			});
			t.t(listen.dispatch(span, {
				type:"custom",
				a: 1,
				bubbles: true,
				cancelable: true
			}));
			t.t(listen.dispatch(span, {
				type:"custom",
				a: 1,
				bubbles: false,
				cancelable: true
			}));
			var signal2 = listen.pausable(div,"custom", function(event){
				order.push(event.a + 1);
				event.preventDefault();
			});
			t.f(listen.dispatch(span, {
				type:"custom",
				a: 2,
				bubbles: true,
				cancelable: true
			}));
			signal2.pause();
			t.t(listen.dispatch(span, {
				type:"custom",
				a: 4,
				bubbles: true,
				cancelable: true
			}));
			signal2.resume();
			signal.cancel();
			t.f(listen.dispatch(span, {
				type:"custom",
				a: 4,
				bubbles: true,
				cancelable: true
			}));
			listen(span, "custom", function(event){
				order.push(6);
				event.stopPropagation();
			});
			t.t(listen.dispatch(span, {
				type:"custom",
				a: 1,
				bubbles: true,
				cancelable: true
			}));
			var button = div.appendChild(document.createElement("button"));
			// make sure we are propagating natively created events too
			listen(div, "click", function(){
				order.push(7);
			});
			button.click();
			t.is(order, [0, 1, 2, 3, 4, 5, 6, 7]);
		},
		function Evented(t){
			var MyClass = dojo.declare([listen.Evented],{
				
			});
			var order = [];
			myObject = new MyClass;
			myObject.on("custom", function(event){
				order.push(event.a);
			});
			myObject.emit("custom", {a:0});
			t.is(order, [0]);
		}
	]
);
