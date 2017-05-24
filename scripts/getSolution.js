define(["sudokuGrid","subdivision"],function(sudokuGrid,sudokuSubdivision){
	return function(){
		var grid = new sudokuGrid();
		var getObjectionToAdding = function(row, column, number, extraKind){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				var kind = subdivision.kind;
				if(kind != sudokuSubdivision.ROW && kind != sudokuSubdivision.COLUMN && extraKind != kind){
					continue;
				}
				var indices = subdivision.kind.getIndices(row,column);
				if(!indices){continue;}
				var index = indices.one;
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

		var clear = function(row, column){
			grid.add(row, column, undefined);
		};

		return {
			getObjectionToAdding:getObjectionToAdding,
			add:add,
			clear:clear
		};
	}
})