define([],function(){
	return requireElement(document.getElementById("mobileButtons").innerHTML, function(div, button){
		
		button(function(buttonDiv, text){
			text.innerHTML = "1";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "2";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "3";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "4";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "5";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "6";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "7";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "8";
		});
		button(function(buttonDiv, text){
			text.innerHTML = "9";
		});
		return {
			append:function(){
				document.body.appendChild(div);
			}
		}
	});
});