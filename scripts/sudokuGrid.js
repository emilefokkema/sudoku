define(["subdivision"],function(subdivision){
	var emptyArrayOfLength = function(n){
		return Array.apply(null, new Array(n));
	};

	var makeSubdivision = function(kind){
		var arr = emptyArrayOfLength(kind.number).map(function(){return emptyArrayOfLength(9);});
		arr.kind = kind;
		return arr;
	};
	
	
	var grid = function(kinds){
		this.kinds = kinds;
		this.subdivisions = [];
		for(var i=0;i<kinds.length;i++){
			this.subdivisions.push(makeSubdivision(kinds[i]));
		}
		this.rows = this.subdivisionFor(subdivision.ROW);
	};
	grid.prototype.add = function(r, c, something){
		for(var i=0;i<this.subdivisions.length;i++){
			var s = this.subdivisions[i];
			var indices = s.kind.getIndices(r, c);
			if(indices){
				s[indices.one][indices.two] = something;
			}
		}
	};
	grid.prototype.subdivisionFor = function(kind){
		return this.subdivisions.filter(function(s){return s.kind == kind;})[0];
	};
	grid.prototype.copyToGrid = function(newGrid){
		var rows = this.rows;
		for(var r=0;r<9;r++){
			for(var c=0;c<9;c++){
				newGrid.add(r, c, rows[r][c]);
			}
		}
		return newGrid;
	};
	grid.prototype.getKinds = function(){
		return this.kinds;
	};
	grid.prototype.map = function(mapper){
		var result = new grid(this.kinds);
		var rows = this.rows;
		for(var r=0;r<9;r++){
			for(var c=0;c<9;c++){
				result.add(r, c, mapper(rows[r][c]));
			}
		}
		return result;
	};
	grid.prototype.empty = function(){
		return new grid(this.kinds);
	};
	grid.nrc = function(){
		return new grid([subdivision.ROW, subdivision.COLUMN, subdivision.SQUARE, subdivision.NRC]);
	};
	grid.normal = function(){
		return new grid([subdivision.ROW, subdivision.COLUMN, subdivision.SQUARE]);
	};
	return grid;
})