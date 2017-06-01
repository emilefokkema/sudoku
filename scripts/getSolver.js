define(["permutator","postponer"],function(permutator, postponer){
	var batchSize = 5000;
	var maxNumberOfSolutions = 2;
	var inRandomOrder = function(arr){
		var result = [];
		var l = arr.length;
		for(var i=0;i<l;i++){
			result.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
		};
		return result;
	};
	return function(solution){
		var clone,
			reset,
			currentRowFiller,
			rowFillers,
			currentRowFillerIndex,
			useRowFiller,
			doStep,
			getRowFiller,
			go,
			solveState,
			currentSolveState,
			going,
			doBatch,
			stop,
			foundSolutions,
			extraKind,
			onStartStopping;

		solveState = {
			NO_SOLUTION:0,
			SOLUTION:1,
			SOLVING:2
		};
		onStartStopping = function(){};
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
				_permutator = new permutator(unfilledIndices.length);
				currentPermutation = null;
				numbersToUse = inRandomOrder(numbersToUse);
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
				rowIndex:rowIndex,
				done:function(){
					return currentPermutation.done;
				}
			};
		};

		reset = postponer(function(_extraKind){
			extraKind = _extraKind;
			console.log("resetting solver, extraKind=");
			clone = solution.clone();
			foundSolutions = foundSolutions.filter(function(s){
				return s.contains(clone) && s.checkAll(extraKind);
			});
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
		}, 3000);
		foundSolutions = [];
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
			else if(clone.checkRow(currentRowFiller.rowIndex, extraKind)){
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
				setTimeout(doBatch,1);
			}
			else if(currentSolveState == solveState.SOLUTION){
				console.log("found solution:\r\n"+clone.toString());
				foundSolutions.push(clone.clone());
				currentSolveState = useRowFiller(currentRowFillerIndex);
				if(foundSolutions.length < maxNumberOfSolutions){
					setTimeout(doBatch,1);
				}else{
					onStartStopping(false);
				}
			}else{
				onStartStopping(false);
			}
		};
		go = function(){
			going = true;
			onStartStopping(going);
			doBatch();
		};
		stop = function(){
			going = false;
			onStartStopping(going);
		};
		reset();
		return {
			reset:function(extraKind){
				stop();
				reset(extraKind);
			},
			onStartStopping:function(f){onStartStopping = f;},
			getNumberOfSolutions:function(){return foundSolutions.length;}
		};
	};
})