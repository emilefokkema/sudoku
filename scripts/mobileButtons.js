define(["setClass"],function(setClass){
	return requireElement(document.getElementById("mobileButtons").innerHTML, function(div, button){
		var editor;
		var makeButton = function(specs){
			button(function(buttonDiv, text){
				text.innerHTML = specs.text || "";
				buttonDiv.addEventListener('mousedown',function(){
					specs.action();
				});
				if(specs.className){
					setClass(text, specs.className, true);
				}
			});
		};
		var makeInputButton = function(n){
			makeButton({
				text:n,
				action:function(){
					editor.suggestValueForSelected(parseInt(n));
				}
			});
		};
		makeInputButton("1");
		makeInputButton("2");
		makeInputButton("3");
		makeInputButton("4");
		makeInputButton("5");
		makeInputButton("6");
		makeInputButton("7");
		makeInputButton("8");
		makeInputButton("9");
		makeButton({className:"fa fa-eraser", action: function(){editor.clearCurrentlySelected();}});
		return {
			append:function(){
				document.body.appendChild(div);
			},
			init:function(_editor){
				editor = _editor;
			}
		}
	});
});