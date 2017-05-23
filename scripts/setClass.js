define([],function(){
	var getOldClassNames = function(el){
		var oldName = el.getAttribute('class') || "";
		return oldName.match(/[^\s]+/g) || [];
	};
	return function(el, className, shouldBeThere){
		var names = getOldClassNames(el).filter(function(n){return n != className;});
		if(shouldBeThere){
			names.push(className);
		}
		el.setAttribute('class', names.join(" "));
	};
});