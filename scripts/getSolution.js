define(["sudokuGrid","subdivision","sender","tally"],function(sudokuGrid,sudokuSubdivision,sender,getTally){
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
		var self;
		var grid = sudokuGrid.normal();
		var tally = getTally(grid.kinds);
		var onAdd = sender();
		var getObjectionToAdding = function(row, column, number){
			return tally.getObjectionToAdding(row, column, number);
		};
		var checkAll = function(){
			for(var i=0;i<grid.subdivisions.length;i++){
				var subdivision = grid.subdivisions[i];
				for(var j=0;j<subdivision.length;j++){
					if(containsDouble(subdivision[j])){
						return false;
					}
				}
			}
			return true;
		};

		var add = function(row, column, number){
			if(number){
				tally.add(row, column, number);
			}else{
				var old = grid.rows[row][column];
				if(old){
					tally.remove(row, column, old);
				}
			}
			grid.add(row, column, number);
			onAdd(row, column, number);
		};

		var tryToAdd = function(row, column, number){
			if(tally.canAdd(row, column, number)){
				add(row, column, number);
				return true;
			}
			return false;
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
			result.useGrid(grid.empty());
			return result;
		};

		var getRows = function(){
			return grid.rows;
		};

		var getGrid = function(){
			return grid;
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
			if(!arrayEquals(grid.getKinds(), otherOne.getGrid().getKinds())){return false;}
			var rows = getRows();
			var otherRows = otherOne.getRows();
			for(var i=0;i<9;i++){
				if(!arrayEquals(rows[i], otherRows[i])){
					return false;
				}
			}
			return true;
		};

		var toFancyString = function(){
			return getRows().map(function(row){return row.map(function(n,i){return ""+(n||0)+(i==2||i==5?"|":" ");}).join("");})
			.map(function(r,i){
				return r+(i==2||i==5?"\r\n------------------":"");
			})
			.join("\r\n");
		};

		var toString = function(){
			return getRows().map(function(r){return r.map(function(n){return n ? n : "0";}).join("");}).join("");
		};

		var log = function(){
			console.log(toString());
		};

		var useGrid = function(g){
			grid = grid.copyToGrid(g);
			tally = getTally(grid.kinds);
			for(var i=0;i<9;i++){
				for(var j=0;j<9;j++){
					if(grid.rows[i][j]){
						tally.add(i,j,grid.rows[i][j]);
					}
				}
			}
			return self;
		};

		self = {
			getObjectionToAdding:getObjectionToAdding,
			add:add,
			tryToAdd:tryToAdd,
			clear:clear,
			checkAll:checkAll,
			contains:contains,
			clone:clone,
			log:log,
			useGrid:useGrid,
			getGrid:getGrid,
			equals:equals,
			getRows:getRows,
			toFancyString:toFancyString,
			onAdd:function(f){onAdd.add(f);},
			toString:toString
		};
		return self;
	};
	var fromString = function(string){
		var match = string.match(/^(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})(\d{9})$/);
		if(!match){return;}
		var result = getSolution();
		for(var i=1;i<=9;i++){
			match[i].match(/\d/g).map(function(n,j){
				result.add(i - 1, j, parseInt(n) || null);
			});
		}
		if(result.checkAll()){
			return result;
		}
	};
	getSolution.fromString = fromString;
	return getSolution;
})