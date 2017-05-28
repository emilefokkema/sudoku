define(["permutator"],function(permutator){
	return function(solution){
		var clone,
			reset,
			currentRowFiller,
			rowFillers,
			currentRowFillerIndex,
			useRowFiller,
			moveBackwards,
			moveForwards,
			doStep,
			getRowFiller;

		getRowFiller = function(row, rowIndex){
			var unfilledIndices = [],
				numbersToUse = [1,2,3,4,5,6,7,8,9],
				_permutator,
				reset,
				currentPermutation,
				fillNext;
			for(var i=0;i<row.length;i++){
				if(!row[i]){
					unfilledIndices.push(i);
				}else{
					numbersToUse.splice(numbersToUse.indexOf(row[i]),1);
				}
			}
			reset = function(){
				unfilledIndices.map(function(i){
					clone.add(rowIndex, i, null);
				});
				_permutator = permutator(unfilledIndices.length);
			};
			fillNext = function(){
				if(currentPermutation.done){return false;}
				currentPermutation = _permutator.next();
				unfilledIndices.map(function(i,j){
					clone.add(rowIndex, currentPermutation[i], numbersToUse[j]);
				});
			};
			return {
				reset:reset,
				fillNext:fillNext
			};
		};
		reset = function(){
			console.log("resetting solver");
			clone = solution.clone();
			rowFillers = [];
			clone.getRows().map(function(row, rowIndex){
				if(row.some(function(x){return !x;})){
					rowFillers.push(getRowFiller(row, rowIndex));
				}
			});
			if(rowFillers.length == 0){
				console.log("nothing left to solve");
				return;
			}
			useRowFiller(0);
		};
		useRowFiller = function(i){
			if(i < 0 || i > rowFillers.length - 1){
				return;
			}
			currentRowFillerIndex = i;
			currentRowFiller = rowFillers[currentRowFillerIndex];
		};
		doStep = function(){

		};
		reset();
		return {
			reset:reset
		};
	};
})