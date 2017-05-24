define(["sudokuGrid"],function(sudokuGrid){
	return function(){
		var grid = new sudokuGrid();
		var getObjectionToAdding = function(row, column, number){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				var index = subdivision.kind.getIndices(row,column).one;
				
					if(subdivision[index].some(function(n){return n == number;})){
						return {
							kind:subdivision.kind,
							index: index
						};
					}
				
			}
		};

		var add = function(row, column, number){
			grid.add(row, column, number);
		};

		return {
			getObjectionToAdding:getObjectionToAdding,
			add:add
		};
	}
})