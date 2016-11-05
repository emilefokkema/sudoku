(function(){
	var makeCanvas = function(planeMath, sender, copySet, shapeFilter, intersectionSet, w, h){
		
	};
	

	window.initGeometry = (function(orig){
		return function(obj){
			orig(obj);
			obj.canvas = makeCanvas(obj.planeMath, obj.sender, obj.copySet, obj.shapeFilter, obj.intersectionSet, obj.w, obj.h);
		};
	})(window.initGeometry || function(){});
})();