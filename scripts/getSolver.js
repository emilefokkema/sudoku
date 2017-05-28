define(["permutator"],function(permutator){
	var batchSize = 5000;
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
			currentSolveState,
			going,
			doBatch,
			stop;

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
			stop();
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
			currentSolveState = useRowFiller(0);
			go();
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
		doStep = function(){
			if(!currentRowFiller.fillNext()){
				currentRowFiller.reset();
				currentSolveState = useRowFiller(currentRowFillerIndex - 1);
			}
			else if(clone.checkAll()){
				currentSolveState = useRowFiller(currentRowFillerIndex + 1);
			}else{
				currentSolveState = useRowFiller(currentRowFillerIndex);
			}
		};
		doBatch = function(){
			if(!going){return;}
			var batchCount = 0;
			while(batchCount < batchSize && currentSolveState == solveState.SOLVING && going){
				doStep();
				batchCount++;
			}
			if(currentSolveState == solveState.SOLVING && going){
				console.log("finish batch");
				setTimeout(doBatch,1);
			}
			else if(currentSolveState == solveState.SOLUTION){
				console.log("found solution: "+clone.toString());
			}else{
				console.log("no solution")
			}
		};
		go = function(){
			console.log("going");
			going = true;
			doBatch();
		};
		stop = function(){
			console.log("stopping");
			going = false;
		};
		reset();
		return {
			reset:reset
		};
	};
})