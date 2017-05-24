define([],function(){
	var squareIndex = function(r, c){
		return 3 * r + c;
	};
	return {
		ROW: {
			getIndices:function(row, column){
				return {
					one:row,
					two:column
				};
			},
			number:9,
			name:"ROW"
		},
		COLUMN:{
			getIndices:function(row, column){
				return {
					one:column,
					two:row
				};
			},
			number:9,
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
			number:9,
			name:"SQUARE"
		},
		NRC:{
			getIndices:function(row, column){
				if(row == 0 || row == 4 || row == 8 || column == 0 || column == 4 || column == 8){
					return;
				}
				var smallRow = Math.floor(row / 5);
				var smallColumn = Math.floor(column / 5);
				var one = 2 * smallRow + smallColumn;
				var two = squareIndex(row - (smallRow == 0 ? 1 : 5), column - (smallColumn == 0 ? 1 : 5));
				if(two > 8){
					throw new Error();
				}
				return {
					one: one,
					two: two
				};
			},
			number:4
		}
	};
})