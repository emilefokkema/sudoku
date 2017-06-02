requirejs(["editor","hash","solution"],function(editor, hash, solution){
	hash.read(function(row, column, n){editor.setSolutionValue(row, column, n);});
	solution.onAdd(function(){
		hash.write(solution.getRows());
	});
});