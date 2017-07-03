importScripts("../require.js");

require.config({
	baseUrl:"../scripts/"
});

requirejs(["permutator","getSolution","getPossibilities","subdivision","sudokuGrid"],function(permutator, getSolution, getPossibilities,subdivision,sudokuGrid){
	var batchSize = 5000;
	var maxNumberOfSolutions = 20;
	var inRandomOrder = function(arr){
		var result = [];
		var l = arr.length;
		for(var i=0;i<l;i++){
			result.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
		};
		return result;
	};
	
	var clone,
		solutionOnLastReset,
		reset,
		currentRowFiller,
		rowFillers,
		currentRowFillerIndex,
		doStep,
		getRowFiller,
		rowIsNotFull,
		go,
		solveState,
		currentSolveState,
		findNextRowFiller,
		going,
		postFoundSolutions,
		doBatch,
		stop,
		saveSolution,
		foundSolutions,
		onStartStopping,
		goForward,
		goBack;

	solveState = {
		NO_SOLUTION:0,
		SOLUTION:1,
		SOLVING:2
	};

	onStartStopping = function(b){
		postMessage({
			name:"startStopping",
			value:b
		});
	};
	getRowFiller = function(row, rowIndex){
		var unfilledIndices = [],
			numbersToUse = [1,2,3,4,5,6,7,8,9],
			_permutator,
			reset,
			currentPermutation,
			fillNext,
			conclude,
			unconclude,
			conclusions = [];
		for(var i=0;i<row.length;i++){
			if(!row[i]){
				unfilledIndices.push(i);
			}else{
				numbersToUse.splice(numbersToUse.indexOf(row[i]),1);
			}
		}
		_permutator = new permutator(unfilledIndices.length);
		currentPermutation = null;
		numbersToUse = inRandomOrder(numbersToUse);
		reset = function(){
			unfilledIndices.map(function(i){
				clone.add(rowIndex, i, null);
			});
			unconclude();
		};
		fillNext = function(){
			unconclude();
			if(currentPermutation && currentPermutation.done){return false;}
			currentPermutation = _permutator.next();
			for(var i=0;i<unfilledIndices.length;i++){
				clone.add(rowIndex, unfilledIndices[currentPermutation.value[i]], numbersToUse[i]);
			}
			return true;
		};
		unconclude = function(){
			conclusions.map(function(c){
				clone.add(c.row, c.column, null);
			});
			conclusions = [];
		};
		conclude = function(){
			getPossibilities(clone).clean().forEachSingle(function(ri, ci, n){
				conclusions.push({
					row:ri,
					column:ci
				});
				clone.add(ri, ci, n);
			});
		};
		return {
			reset:reset,
			fillNext:fillNext,
			rowIndex:rowIndex,
			conclude:conclude,
		};
	};
	reset = function(solution){
		console.log("resetting solver");
		var somethingWasRemoved = false;
		var newOne = solution.clone();
		if(solutionOnLastReset && solutionOnLastReset.contains(newOne) && !solutionOnLastReset.equals(newOne)){
			somethingWasRemoved = true;
		}
		solutionOnLastReset = newOne;
		clone = newOne.clone();
		var solutionsLeft = [];
		for(var i=0;i<foundSolutions.length;i++){
			foundSolutions[i].useGrid(clone.getGrid().empty());
			if(foundSolutions[i].checkAll() && foundSolutions[i].contains(clone)){
				solutionsLeft.push(foundSolutions[i]);
			}
		}
		if(solutionsLeft.length == foundSolutions.length && !somethingWasRemoved && currentSolveState == solveState.NO_SOLUTION){
			console.log("addition agrees with all found solutions");
			return;
		}
		console.log("solutions left: "+solutionsLeft.length);
		foundSolutions = solutionsLeft;
		postFoundSolutions();
		var possibilities = getPossibilities(clone);
		possibilities.clean();
		if(possibilities.hasImpossibility()){
			onStartStopping(false);
			return;
		}
		possibilities.forEachSingle(function(ri, ci, n){
			console.log("filling in single possibility");
			clone.add(ri, ci, n);
		});
		rowFillers = [];
		currentRowFiller = null;
		var nextRowFiller = findNextRowFiller();
		if(!nextRowFiller){
			saveSolution();
			currentSolveState = solveState.NO_SOLUTION;
			onStartStopping(false);
			return;
		}
		
		currentRowFiller = nextRowFiller;
		currentSolveState = solveState.SOLVING;
		go();
	};
	foundSolutions = [];
	rowIsFull = function(row){
		return row.every(function(x){return x;});
	};
	findNextRowFiller = function(){
		var currentRowIndex = currentRowFiller ? currentRowFiller.rowIndex : 0;
		var rows = clone.getRows();
		var currentRow;
		while(currentRowIndex < 9 && rowIsFull(currentRow = rows[currentRowIndex])){
			currentRowIndex++;
		}
		if(currentRowIndex < 9){
			var result = getRowFiller(currentRow, currentRowIndex);
			rowFillers.push(result);
			return result;
		}
	};
	postFoundSolutions = function(){
		postMessage({
			name:"foundSolutions",
			solutions:foundSolutions.map(function(s){return s.toString();})
		});
	};
	goForward = function(){
		currentRowFiller.conclude();
		var nextRowFiller = findNextRowFiller();
		if(!nextRowFiller){
			currentSolveState = solveState.SOLUTION;
			return;
		}
		currentRowFiller = nextRowFiller;
	};
	goBack = function(){
		currentRowFiller.reset();
		rowFillers.pop();
		if(rowFillers.length == 0){
			currentSolveState = solveState.NO_SOLUTION;
			return;
		}
		currentRowFiller = rowFillers[rowFillers.length - 1];
	};
	doStep = function(){
		if(!currentRowFiller.fillNext()){
			goBack();
		}
		else if(clone.checkRow(currentRowFiller.rowIndex)){
			goForward();
		}
	};
	saveSolution = function(){
		if(!foundSolutions.some(function(s){return s.equals(clone);})){
			foundSolutions.push(clone.clone());
			console.log("found new solution. total: "+foundSolutions.length);
			postFoundSolutions();
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
			saveSolution();
			if(foundSolutions.length < maxNumberOfSolutions){
				onStartStopping(true);
				currentSolveState = solveState.SOLVING;
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
	onmessage = function(e){
		var data = e.data;
		var name = data.name;
		if(name == "useSolution"){
			var body = data.body;
			var s = getSolution.fromString(data.body);
			var kinds = [];
			for(var p in subdivision){
				if(subdivision.hasOwnProperty(p) && data.kinds.indexOf(subdivision[p].name) > -1){
					kinds.push(subdivision[p]);
				}
			}
			s.useGrid(new sudokuGrid(kinds));
			stop();
			reset(s);
		}
	};

});