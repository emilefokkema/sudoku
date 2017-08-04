define(["numberSet"],function(numberSet){
	var subdivisionTally = function(subdivision){
		var sets = subdivision.map(function(){return numberSet();});
		var add = function(row, column, number){
			var indices = subdivision.kind.getIndices(row, column);
			if(indices){
				sets[indices.one].add(number);
			}
		};
		var canAdd = function(row, column, number){
			var indices = subdivision.kind.getIndices(row, column);
			if(!indices){
				return true;
			}
			return !sets[indices.one].contains(number);
		};
		return {
			add:add,
			canAdd:canAdd
		};
	};
	var tally = function(subdivisions){
		var tallies = subdivisions.map(function(s){return subdivisionTally(s);});
		var add = function(row, column, number){
			for(var i=0;i<tallies.length;i++){
				tallies[i].add(row, column, number);
			}
		};
		var canAdd = function(row, column, number){
			for(var i=0;i<tallies.length;i++){
				if(!tallies[i].canAdd(row, column, number)){
					return false;
				}
			}
			return true;
		};
		return {
			add:add,
			canAdd:canAdd
		};
	};
	return tally;
});