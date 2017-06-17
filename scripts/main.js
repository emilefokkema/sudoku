requirejs(["mobileButtons", "editor","hash"],function(mobileButtons, editor, hash){
	hash.read(function(row, column, n){editor.setSolutionValue(row, column, n);});
	editor.setPossibilities();
	// solution.onAdd(function(){
	// 	hash.write(solution.getRows());
	// });
	mobileButtons.append();
	mobileButtons.init(editor);
});