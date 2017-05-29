define([], function(){
	return function(f, interval){
		var timeout;
		return function(){
			if(timeout){
				clearTimeout(timeout);
			}
			timeout = setTimeout(f, interval);
		};
	};
})