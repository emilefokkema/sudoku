define(["permutator","postponer","getSolution","getPossibilities"],function(permutator, postponer, getSolution, getPossibilities){
	var worker = new Worker("solverWorker.js");
	
	var onStartStopping = function(){};
	var foundSolutions = [];
	worker.onmessage = function(e){
		var data = e.data;
		var name = data.name;
		if(name == "startStopping"){
			onStartStopping(data.value);
		}else if(name == "foundSolutions"){
			foundSolutions = data.solutions.map(function(s){
				return getSolution.fromString(s);
			});
		}
	}
	return {
		onStartStopping:function(f){onStartStopping = f;},
		getSolutions:function(){return foundSolutions;},
		useSolution:function(s){
			worker.postMessage({
				name:"useSolution",
				body:s.toString(),
				extraKind:!!s.getExtraKind()
			});
		}
	};
	
})