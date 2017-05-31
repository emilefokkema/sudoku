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
		this.rows = this.subdivisions.filter(function(s){return s.kind == subdivision.ROW;})[0];
		this.columns = this.subdivisions.filter(function(s){return s.kind == subdivision.COLUMN;})[0];
		this.squares = this.subdivisions.filter(function(s){return s.kind == subdivision.SQUARE;})[0];
		this.nrcs = this.subdivisions.filter(function(s){return s.kind == subdivision.NRC;})[0];
	};
	grid.prototype.add = function(r, c, something){
		this.subdivisions.map(function(s){
			var indices = s.kind.getIndices(r, c);
			if(indices){
				s[indices.one][indices.two] = something;
			}
		});
	};
	return grid;
})