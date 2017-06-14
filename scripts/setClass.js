define([],function(){
	var getClassNames = function(s){
		return s.match(/[^\s]+/g) || [];
	};
	var getOldClassNames = function(el){
		var oldName = el.getAttribute('class') || "";
		return getClassNames(oldName);
	};
	return function(el, classNameString, shouldBeThere){
		var classNames = getClassNames(classNameString);
		var names = getOldClassNames(el).filter(function(n){return classNames.indexOf(n) == -1;});
		if(shouldBeThere){
			names = names.concat(classNames);
		}
		el.setAttribute('class', names.join(" "));
	};
});