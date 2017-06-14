define(["sudokuGrid","subdivision"],function(sudokuGrid, subdivision){
	var set = function(){
		var self;
		var all = [1,2,3,4,5,6,7,8,9];
		var eliminate = function(n){
			var ind = all.indexOf(n);
			if(ind > -1){
				all.splice(ind,1);
			}
		};
		var contains = function(n){
			return !self.occupiedBy && all.indexOf(n) > -1;
		};
		self = {
			possibilities:all,
			eliminate:eliminate,
			occupiedBy:null,
			contains:contains
		};
		return self;
	};
	var reverseMap = function(setArray){
		var result = [];
		for(var n=1;n<=9;n++){
			result[n] = [];
			for(var i=0;i<setArray.length;i++){
				if(setArray[i].contains(n)){
					result[n].push(i);
				}
			}
		}
		return result;
	};
	var findPartWithContainedSet = function(grid){
		for(var i=0;i<grid.subdivisions.length;i++){
			var sub = grid.subdivisions[i];
			for(var one = 0;one<sub.kind.number;one++){
				var list = sub[one];
				var reverse = reverseMap(list);
				for(var two=0;two<9;two++){
					var s = list[two];
					if(!s.occupiedBy && s.possibilities.length == 1 && reverse[s.possibilities[0]].length > 1){
						return {
							list:list,
							numbers:[s.possibilities[0]],
							indices:[two]
						}
					}
				}
			}
		}
	};
	var cleanPartWithContainedSet = function(part){
		for(var i=0;i<9;i++){
			if(part.indices.indexOf(i) == -1){
				for(var j=0;j<part.numbers.length;j++){
					part.list[i].eliminate(part.numbers[j]);
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
				grid.add(r,c,set());
			}
		}
		for(r=0;r<9;r++){
			for(c=0;c<9;c++){
				var n = rows[r][c];
				if(n){
					grid.rows[r][c].occupiedBy = n;
					grid.subdivisions.map(function(s){
						if(s.kind == subdivision.NRC && !extraKind){return;}
						var indices = s.kind.getIndices(r, c);
						if(indices){
							grid.subdivisionFor(s.kind)[indices.one].map(function(p){p.eliminate(n);});
						}
					});
				} 
			}
		}
		var partWithContainedSet;
		partWithContainedSet = findPartWithContainedSet(grid);
		if(partWithContainedSet){
			console.log(partWithContainedSet);
		}
		return grid.map(function(s){
			if(s.occupiedBy){return null;}
			return s.possibilities;
		}).rows;
	};
})