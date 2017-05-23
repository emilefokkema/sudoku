define([],function(){
	var lengthNineArray = function(){
		return Array.apply(null, new Array(9));
	};
	var eightyOne = function(){
		return lengthNineArray().map(function(){return lengthNineArray();});
	};
	var getRowSubdivision = function(row, column){
		return {
			one:row,
			two:column
		};
	};
	var getColumnSubdivision = function(row, column){
		return {
			one:column,
			two:row
		};
	};
	var squareIndex = function(r, c){
		return 3 * r + c;
	};
	var getSquareSubdivision = function(row, column){
		var smallRow = Math.floor(row / 3);
		var smallColumn = Math.floor(column / 3);
		return {
			one: squareIndex(smallRow, smallColumn),
			two: squareIndex(row - 3 * smallRow, column - 3 * smallColumn)
		};
	};
	var grid = function(){
		this.rows = eightyOne();
		this.columns = eightyOne();
		this.squares = eightyOne();
	};
	grid.prototype.add = function(r, c, something){
		var row = getRowSubdivision(r, c);
		this.rows[row.one][row.two] = something;

		var column = getColumnSubdivision(r, c);
		this.columns[column.one][column.two] = something;

		var square = getSquareSubdivision(r, c);
		this.squares[square.one][square.two] = something;

		return {
			row:row.one,
			column:column.one,
			square:square.one
		};
	};
	return grid;
})