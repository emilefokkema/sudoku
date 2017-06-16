define(["getSolution"],function(getSolution){
	return {
		read:function(setValue){
			var string = window.location.hash;
			if(!string){return;}
			string = string.substr(1);
			var solution = getSolution.fromString(string);
			if(solution){
				solution.getRows().map(function(row, rowIndex){
					row.map(function(c, columnIndex){
						setValue(rowIndex, columnIndex, c);
					});
				});
			}
		},
		write:function(rows){
			window.location.hash = rows.map(function(r){return r.map(function(n){return n?""+n:"0";}).join("");}).join("")
		}
	};
})