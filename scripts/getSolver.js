define(["permutator"],function(permutator){
	var batchSize = 1000;
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
			getRowFiller,
			go,
			solveState,
			batchCount;

		solveState = {
			NO_SOLUTION:0,
			SOLUTION:1,
			SOLVING:2
		};
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
				if(currentPermutation && currentPermutation.done){return false;}
				currentPermutation = _permutator.next();
				for(var i=0;i<unfilledIndices.length;i++){
					clone.add(rowIndex, unfilledIndices[currentPermutation.value[i]], numbersToUse[i]);
				}
				return true;
			};
			reset();
			return {
				reset:reset,
				fillNext:fillNext,
				rowIndex:rowIndex
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
			if(i == currentRowFillerIndex){
				currentRowFiller = rowFillers[currentRowFillerIndex];
				return solveState.SOLVING;
			}
			if(i == -1){
				return solveState.NO_SOLUTION;
			}
			if(i == rowFillers.length){
				return solveState.SOLUTION;
			}
			currentRowFillerIndex = i;
			currentRowFiller = rowFillers[currentRowFillerIndex];
			console.log("moved to row "+currentRowFiller.rowIndex);
			return solveState.SOLVING;
		};
		doStep = function(after){
			var result;
			if(!currentRowFiller.fillNext()){
				currentRowFiller.reset();
				result = useRowFiller(currentRowFillerIndex - 1);
			}
			else if(clone.checkAll()){
				result = useRowFiller(currentRowFillerIndex + 1);
			}else{
				result = useRowFiller(currentRowFillerIndex);
			}
			after && after(result);
		};
		go = function(){
			batchCount = 0;
			var toDoAfter = function(s){
				batchCount++;
				if(s == solveState.SOLVING){
					if(batchCount == batchSize){
						batchCount = 0;
						console.log("done "+batchSize);
						setTimeout(function(){
							doStep(toDoAfter);
						},1);
					}else{
						doStep(toDoAfter);
					}
				}else if(s == solveState.NO_SOLUTION){
					console.log("no solution");
					return;
				}else{
					console.log("found solution");
					return;
				}
			};
			doStep(toDoAfter);
		};
		reset();
		go();
		return {
			reset:reset
		};
	};
})