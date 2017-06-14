define(["sudokuGrid","subdivision"],function(sudokuGrid, subdivision){
	var set = function(){
		var all = [1,2,3,4,5,6,7,8,9];
		var eliminate = function(n){
			var ind = all.indexOf(n);
			if(ind > -1){
				all.splice(ind,1);
			}
		};
		return {
			all:all,
			eliminate:eliminate,
			alreadyOccupied:false
		};
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
					grid.rows[r][c].alreadyOccupied = true;
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
		return grid.map(function(s){
			if(s.alreadyOccupied){return null;}
			return s.all;
		}).rows;
	};
})