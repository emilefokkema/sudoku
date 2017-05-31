define([], function(){
	return function(f, interval){
		var timeout, args;
		return function(){
			args = Array.prototype.slice.apply(arguments,[]);
			if(timeout){
				clearTimeout(timeout);
			}
			timeout = setTimeout(function(){
				f.apply(null, args);
			}, interval);
		};
	};
})