requirejs(["editor","hash"],function(editor, hash){
	hash.read(function(row, column, n){editor.setSolutionValue(row, column, n);});
});