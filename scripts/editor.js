define(["sudokuGrid","setClass"],function(sudokuGrid, setClass){
	var makeCell = function(makeElement){
		return makeElement(function(input, container){
			var setError = function(val){
				setClass(container,"error",val);
			};
			return {
				setError:setError
			};
		});
	};

	return requireElement(document.getElementById("editor").innerHTML,function(div, row){
		document.body.appendChild(div);
		var grid = new sudokuGrid();

		for(var i=0;i<9;i++){
			row(function(cell){
				for(j=0;j<9;j++){
					var gridPosition;
					gridPosition = grid.add(i, j, makeCell(cell));
				}
			});
		}

		grid.rows[1][2].setError(true);
	});
})