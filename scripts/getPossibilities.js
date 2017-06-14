define(["sudokuGrid","subdivision","numberSet"],function(sudokuGrid, subdivision, numberSet){
	
	var reverseMap = function(setArray){
		var result = [];
		for(var n=1;n<=9;n++){
			result[n] = [];
			for(var i=0;i<setArray.length;i++){
				if(setArray[i] && setArray[i].contains(n)){
					result[n].push(i);
				}
			}
		}
		return result;
	};
	var findContainedSet = function(list){
		var reverse = reverseMap(list);
		for(var two=0;two<9;two++){
			var possibilities = list[two] ? list[two].toArray() : [];
			if(possibilities.length == 1 && reverse[possibilities[0]].length > 1){
				return {
					numbers:[possibilities[0]],
					indices:[two]
				}
			}
		}
	};
	var findPartWithContainedSet = function(grid, extraKind){
		for(var i=0;i<grid.subdivisions.length;i++){
			var sub = grid.subdivisions[i];
			if(sub.kind == subdivision.NRC && !extraKind){continue;}
			for(var one = 0;one<sub.kind.number;one++){
				var containedSet = findContainedSet(sub[one]);
				if(containedSet){
					containedSet.list = sub[one];
					containedSet.one = one;
					containedSet.kind = sub.kind;
					return containedSet;
				}
			}
		}
	};
	var cleanPartWithContainedSet = function(part){
		for(var i=0;i<9;i++){
			if(part.indices.indexOf(i) == -1){
				for(var j=0;j<part.numbers.length;j++){
					part.list[i] && part.list[i].remove(part.numbers[j]);
				}
			}
		}
	};
	return function(solution){
		var r, c, rows = solution.getRows();
		var extraKind = solution.getExtraKind();
		var grid = new sudokuGrid();
		for(r=0;r<9;r++){
			for(c=0;c<9;c++){
				grid.add(r,c,numberSet([1,2,3,4,5,6,7,8,9]));
			}
		}
		for(r=0;r<9;r++){
			for(c=0;c<9;c++){
				var n = rows[r][c];
				if(n){
					grid.add(r,c,null);
					grid.subdivisions.map(function(s){
						if(s.kind == subdivision.NRC && !extraKind){return;}
						var indices = s.kind.getIndices(r, c);
						if(indices){
							grid.subdivisionFor(s.kind)[indices.one].map(function(p){p && p.remove(n);});
						}
					});
				} 
			}
		}
		var partWithContainedSet;
		while(partWithContainedSet = findPartWithContainedSet(grid, extraKind)){
			console.log("cleaning part with contained set");
			cleanPartWithContainedSet(partWithContainedSet);
		}
		return grid.map(function(s){
			return s ? s.toArray() : null;
		}).rows;
	};
})