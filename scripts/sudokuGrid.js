define([],function(){
	var lengthNineArray = function(){
		return Array.apply(null, new Array(9));
	};
	var eightyOne = function(){
		return lengthNineArray().map(function(){return lengthNineArray();});
	};
	var squareIndex = function(r, c){
		return 3 * r + c;
	};
	var subdivision = {
		ROW: {
			getIndices:function(row, column){
				return {
					one:row,
					two:column
				};
			},
			name:"ROW"
		},
		COLUMN:{
			getIndices:function(row, column){
				return {
					one:column,
					two:row
				};
			},
			name:"COLUMN"
		},
		SQUARE:{
			getIndices:function(row, column){
				var smallRow = Math.floor(row / 3);
				var smallColumn = Math.floor(column / 3);
				return {
					one: squareIndex(smallRow, smallColumn),
					two: squareIndex(row - 3 * smallRow, column - 3 * smallColumn)
				};
			},
			name:"SQUARE"
		}
	};
	var makeSubdivision = function(kind){
		var arr = eightyOne();
		arr.kind = kind;
		return arr;
	};
	
	
	var grid = function(){
		this.subdivisions = [];
		for(var p in subdivision){
			if(subdivision.hasOwnProperty(p)){
				this.subdivisions.push(makeSubdivision(subdivision[p]));
			}
		}
	};
	grid.prototype.add = function(r, c, something){
		this.subdivisions.map(function(s){
			var indices = s.kind.getIndices(r, c);
			s[indices.one][indices.two] = something;
		});
	};
	grid.subdivision = subdivision;
	return grid;
})