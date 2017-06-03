define(["sudokuGrid","subdivision","sender"],function(sudokuGrid,sudokuSubdivision,sender){
	var containsDouble = function(arr){
		var toFind, arri, l = arr.length, found = 0;
		for(var i=0;i<l;i++){
			arri = arr[i];
			if(!arri){continue;}
			toFind = 1 << (arri - 1);
			if(found & toFind){
				return true;
			}
			found |= toFind;
		}
		return false;
	};

	var arrayContains = function(arr1, arr2){
		for(var i=0;i<arr2.length;i++){
			if(arr2[i] && arr1[i] != arr2[i]){
				return false;
			}
		}
		return true;
	};

	var arrayEquals = function(arr1, arr2){
		for(var i=0;i<arr1.length;i++){
			if(arr1[i] != arr2[i]){
				return false;
			}
		}
		return true;
	};
	var getSolution = function(){
		var grid = new sudokuGrid();
		var extraKind = null;
		var onSetExtraKind = sender();
		var onAdd = sender();
		var getObjectionToAdding = function(row, column, number){
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
		var checkAll = function(){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				var kind = subdivision.kind;
				if(kind != sudokuSubdivision.ROW &&
					kind != sudokuSubdivision.COLUMN &&
					kind != sudokuSubdivision.SQUARE &&
					extraKind != kind){
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
			onAdd(row, column, number);
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
			result.setExtraKind(extraKind);
			return result;
		};

		var getRows = function(){
			return grid.rows;
		};

		var contains = function(otherOne){
			var rows = getRows();
			var otherRows = otherOne.getRows();
			for(var i=0;i<9;i++){
				if(!arrayContains(rows[i], otherRows[i])){
					return false;
				}
			}
			return true;
		};

		var equals = function(otherOne){
			if(extraKind != otherOne.getExtraKind()){return false;}
			var rows = getRows();
			var otherRows = otherOne.getRows();
			for(var i=0;i<9;i++){
				if(!arrayEquals(rows[i], otherRows[i])){
					return false;
				}
			}
			return true;
		};

		var toString = function(){
			return getRows().map(function(row){return row.map(function(n,i){return ""+(n||0)+(i==2||i==5?"|":" ");}).join("");})
			.map(function(r,i){
				return r+(i==2||i==5?"\r\n------------------":"");
			})
			.join("\r\n");
		};

		var log = function(){
			console.log(toString());
		};

		var setExtraKind = function(e){
			extraKind = e;
			onSetExtraKind(e);
		};

		var getExtraKind = function(){return extraKind;};

		var checkRow = function(rowIndex){
			for(var i=0;i<4;i++){
				var subdivision = grid.subdivisions[i];
				var kind = subdivision.kind;
				if(kind == sudokuSubdivision.COLUMN || kind == sudokuSubdivision.SQUARE || kind == extraKind){
					var checked = 0;
					for(var j=0;j<9;j++){
						var indices = kind.getIndices(rowIndex, j);
						if(!indices){continue;}
						var one = indices.one;
						var maskOne = 1 << one;
						if(checked & maskOne){continue;}
						checked |= maskOne;
						if(containsDouble(subdivision[one])){
							return false;
						}
					}
				}
			}
			return true;
		};

		return {
			getObjectionToAdding:getObjectionToAdding,
			add:add,
			clear:clear,
			checkAll:checkAll,
			contains:contains,
			clone:clone,
			log:log,
			equals:equals,
			getRows:getRows,
			onSetExtraKind:function(f){onSetExtraKind.add(f);},
			onAdd:function(f){onAdd.add(f);},
			setExtraKind:setExtraKind,
			getExtraKind:getExtraKind,
			toString:toString,
			checkRow:checkRow
		};
	};
	return getSolution();
})