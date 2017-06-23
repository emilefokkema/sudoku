define(["sudokuGrid","subdivision","numberSet","getSolution","findContainedSet"],function(sudokuGrid, subdivision, numberSet, getSolution,findContainedSet){

	var findPartWithContainedSet = function(grid, size){
		for(var i=0;i<grid.subdivisions.length;i++){
			var sub = grid.subdivisions[i];
			for(var one = 0;one<sub.kind.number;one++){
				var containedSet = findContainedSet(sub[one], size);
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
		var grid = solution.getGrid().empty();
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
						var indices = s.kind.getIndices(r, c);
						if(indices){
							s[indices.one].map(function(p){p && p.remove(n);});
						}
					});
				} 
			}
		}
		var clean = function(){
			var partWithContainedSet;
			while(partWithContainedSet = findPartWithContainedSet(grid)){
				console.log("cleaning part with contained set");
				cleanPartWithContainedSet(partWithContainedSet);
			}
		};
		var it = {
			clean:function(){
				clean();
				return it;
			},
			findSinglePossiblity:function(){
				return findPartWithContainedSet(grid, 1);
			},
			hasImpossibility:function(){
				var rows = grid.rows;
				for(var i=0;i<9;i++){
					for(var j=0;j<9;j++){
						if(rows[i][j] && rows[i][j].length == 0){
							return true;
						}
					}
				}
				return false;
			},
			getRows: function(){
				return grid.map(function(s){
					return s ? s.toArray() : null;
				}).rows;
			}
		};
		return it;
	};
	return getPossibilities;
})