define([],function(){
	var getDistribution = function(){
		var entries = [];
		var add = function(n){
			for(var i=0;i<entries.length;i++){
				if(entries[i].n == n){
					entries[i].frequency++;
					return;
				}
			}
			entries.push({
				n:n,
				frequency:1
			});
		};
		return {
			add:add,
			entries:entries
		};
	};
	return function(solutions){
		var distributions = Array.apply(null, new Array(9)).map(function(){return Array.apply(null, new Array(9)).map(getDistribution);});
		for(var i=0;i<solutions.length;i++){
			var rows = solutions[i].getRows();
			for(var r=0;r<9;r++){
				for(var c=0;c<9;c++){
					distributions[r][c].add(rows[r][c]);
				}
			}
		}
		return distributions;
	};
})