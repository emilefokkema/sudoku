define(["numberSet"],function(numberSet){
	var subdivisionTally = function(kind){
		var sets = Array.apply(null, new Array(kind.number)).map(function(){return numberSet();});
		var add = function(row, column, number){
			var indices = kind.getIndices(row, column);
			if(indices){
				sets[indices.one].add(number);
			}
		};
		var canAdd = function(row, column, number){
			var indices = kind.getIndices(row, column);
			if(!indices){
				return true;
			}
			return !sets[indices.one].contains(number);
		};
		var getObjectionToAdding = function(row, column, number){
			var indices = kind.getIndices(row, column);
			if(!indices){
				return null;
			}
			if(sets[indices.one].contains(number)){
				return {
					kind:kind,
					index:indices.one
				};
			}
			return null;
		};
		return {
			add:add,
			canAdd:canAdd,
			getObjectionToAdding:getObjectionToAdding
		};
	};
	var tally = function(kinds){
		var tallies = kinds.map(function(k){return subdivisionTally(k);});
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
		var getObjectionToAdding = function(row, column, number){
			var result = null;
			for(var i=0;i<tallies.length;i++){
				if(result = tallies[i].getObjectionToAdding(row, column, number)){
					return result;
				}
			}
			return result;
		};
		return {
			add:add,
			canAdd:canAdd,
			getObjectionToAdding:getObjectionToAdding
		};
	};
	return tally;
});