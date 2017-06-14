define(["subdivision"],function(subdivision){
	var emptyArrayOfLength = function(n){
		return Array.apply(null, new Array(n));
	};

	var makeSubdivision = function(kind){
		var arr = emptyArrayOfLength(kind.number).map(function(){return emptyArrayOfLength(9);});
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
		this.rows = this.subdivisionFor(subdivision.ROW);
		this.columns = this.subdivisionFor(subdivision.COLUMN);
		this.squares = this.subdivisionFor(subdivision.SQUARE);
		this.nrcs = this.subdivisionFor(subdivision.NRC);
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
	grid.prototype.map = function(mapper){
		var result = new grid();
		var rows = this.rows;
		for(var r=0;r<9;r++){
			for(var c=0;c<9;c++){
				result.add(r, c, mapper(rows[r][c]));
			}
		}
		return result;
	};
	return grid;
})