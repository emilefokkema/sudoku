define(["sudokuGrid","subdivision","numberSet","getSolution"],function(sudokuGrid, subdivision, numberSet, getSolution){
	
	var reverse = function(possibilities, list){
		var indices = numberSet();
		for(var i=0;i<list.length;i++){
			if(list[i] && list[i].intersectWith(possibilities).length){
				indices.add(i);
			}
		}
		return indices;
	};
	var image = function(indices, list){
		var result = numberSet();
		indices.toArray().map(function(i){
			result = result.plus(list[i] || numberSet());
		});
		return result;
	};
	var findContainedSet = function(list){
		for(var two=0;two<9;two++){
			var possibilities = list[two] || numberSet();
			if(possibilities.length == 1 && reverse(possibilities, list).length > 1){
				return {
					numbers:possibilities,
					indices:numberSet([two])
				}
			}
		}
		for(var n=1;n<=9;n++){
			var where = reverse(numberSet([n]), list);
			if(where.length == 1 && image(where, list).length > 1){
				return {
					numbers:numberSet([n]),
					indices:where
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
		var numbers = part.numbers.toArray();
		var indices = part.indices.toArray();
		for(var i=0;i<9;i++){
			if(!part.indices.contains(i)){
				for(var j=0;j<numbers.length;j++){
					part.list[i] && part.list[i].remove(numbers[j]);
				}
			}else{
				for(var n=1;n<=9;n++){
					if(!part.numbers.contains(n)){
						part.list[i] && part.list[i].remove(n);
					}
				}
			}
		}
	};
	var getPossibilities = function(solution){
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

	try{
		var testPossibilities = getPossibilities(getSolution.fromString("000200000103005007780900000001030000035804720000090600000009045900700302000006000"));
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				if(testPossibilities[i][j] && testPossibilities[i][j].length != 1){
					throw new Error("possibilities test failed");
				}
			}
		}
	}catch(e){
		console.error(e.message);
	}
	

	return getPossibilities;
})