define([],function(){
	return requireElement(document.getElementById("mobileButtons").innerHTML, function(div, button){
		var editor;
		var makeInputButton = function(n){
			button(function(buttonDiv, text){
				text.innerHTML = n;
				buttonDiv.addEventListener('mousedown',function(){
					editor.suggestValueForSelected(parseInt(n));
				});
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