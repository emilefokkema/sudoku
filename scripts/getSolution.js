define(["sudokuGrid","subdivision"],function(sudokuGrid,sudokuSubdivision){
	var containsDouble = function(arr){
		var found = [];
		for(var i=0;i<arr.length;i++){
			if(found.some(function(n){return n && arr[i] && n == arr[i];})){
				return true;
			}
			found.push(arr[i]);
		}
		return false;
	};
	var getSolution = function(){
		var grid = new sudokuGrid();
		var getObjectionToAdding = function(row, column, number, extraKind){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				var kind = subdivision.kind;
				if(kind != sudokuSubdivision.ROW && kind != sudokuSubdivision.COLUMN && kind != sudokuSubdivision.SQUARE && extraKind != kind){
					continue;
				}
				var indices = subdivision.kind.getIndices(row,column);
				if(!indices){continue;}
				var index = indices.one;
				if(subdivision[index].some(function(n, j){return n == number && j != indices.two;})){
					return {
						kind:subdivision.kind,
						index: index
					};
				}
			}
		};
		var checkAll = function(extraKind){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				var kind = subdivision.kind;
				if(kind != sudokuSubdivision.ROW && kind != sudokuSubdivision.COLUMN && kind != sudokuSubdivision.SQUARE && extraKind != kind){
					continue;
				}
				for(var j=0;j<subdivision.length;j++){
					if(containsDouble(subdivision[j])){
						return false;
					}
				}
			}
			return true;
		};

		var add = function(row, column, number){
			grid.add(row, column, number);
		};

		var clear = function(row, column){
			grid.add(row, column, undefined);
		};

		var clone = function(){
			var result = getSolution();
			getRows().map(function(row, rowIndex){
				row.map(function(n, columnIndex){
					result.add(rowIndex, columnIndex, n);
				});
			});
			return result;
		};

		var getRows = function(){
			return grid.subdivisions.filter(function(s){return s.kind == sudokuSubdivision.ROW;})[0];
		};

		return {
			getObjectionToAdding:getObjectionToAdding,
			add:add,
			clear:clear,
			checkAll:checkAll,
			clone:clone,
			getRows:getRows
		};
	};
	return getSolution;
})