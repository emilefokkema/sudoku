define(["sudokuGrid","setClass","solution","subdivision","solver","makeCell","getDistribution"],function(sudokuGrid, setClass, solution, subdivision, solver, makeCell, getDistribution){
	var kind = {
		NRC:{className:"nrc"},
		NORMAL:{className:""}
	};

	var solverState = {
		NO_SOLUTION:{className:"no-solution"},
		ONE_SOLUTION:{className:"one-solution"},
		MANY_SOLUTIONS:{className:"many-solutions"}
	};
	
	var setKindClass = function(el, k){
		for(var kk in kind){
			if(kind.hasOwnProperty(kk)){
				setClass(el, kind[kk].className, kind[kk] == k);
			}
		}
	};

	var setSolverStateClass = function(el, k){
		for(var ss in solverState){
			if(solverState.hasOwnProperty(ss)){
				setClass(el, solverState[ss].className, solverState[ss] == k);
			}
		}
	};

	return requireElement(document.getElementById("editor").innerHTML,
		function(
			div,
			row,
			settingsButton,
			closeSettingsButton,
			nrc,
			normal,
			solverStateDiv,
			revealSolutionCheckbox,
			revealDistributionCheckbox){
				document.body.appendChild(div);
				var grid = new sudokuGrid();
				var setSingleSolution = function(s){
					if(s){
						var rows = s.getRows();
						grid.rows.map(function(row, rowIndex){
							row.map(function(cell, columnIndex){
								cell.setRevealerValue(rows[rowIndex][columnIndex]);
							});
						});
					}else{
						grid.rows.map(function(row, rowIndex){
							row.map(function(cell, columnIndex){
								cell.setRevealerValue();
							});
						});
					}
				};
				var setManySolutions = function(solutions){
					var divergenceMap = getDistribution(solutions);
					grid.rows.map(function(row, rowIndex){
						row.map(function(cell, columnIndex){
							cell.setDistribution(divergenceMap[rowIndex][columnIndex].entries);
						});
					});
				};
				solver.onStartStopping(function(going){
					setClass(solverStateDiv, "busy", going);
					setSingleSolution(null);
					var solutions = solver.getSolutions();
					var number = solutions.length;
					if(number == 0){
						if(!going){
							setSolverStateClass(div, solverState.NO_SOLUTION);
						}
					}else if(number == 1){
						setSolverStateClass(div, solverState.ONE_SOLUTION);
						setSingleSolution(solutions[0]);
					}else{
						setSolverStateClass(div, solverState.MANY_SOLUTIONS);
						setManySolutions(solutions);
					}
				});
				var currentKind = kind.NORMAL;
				var setSubdivisionError = function(kind, index, bool){
					grid.subdivisions.map(function(s){
						if(s.kind == kind){
							s[index].map(function(cell){cell.setError(bool);});
						}
					});
				};
				var getExtraSubdivision = function(){
					return currentKind == kind.NRC ? subdivision.NRC : null;
				};
				var setSolutionValue = function(row, column, n){
					solution.add(row, column, n);
				};
				var suggestSolutionValue = function(row, column, n){
					var objection = solution.getObjectionToAdding(row, column, n, getExtraSubdivision());
					if(objection){
						setSubdivisionError(objection.kind, objection.index, true);
						return function(){
							setSubdivisionError(objection.kind, objection.index, false);
						}
					}
				};
				var addCell = function(row, column, makeElement){
					grid.add(row, column, makeCell(makeElement, function(n){return suggestSolutionValue(row, column, n);}, function(n){setSolutionValue(row, column, n);}));
				};
				for(var i=0;i<9;i++){
					row(function(cell){
						for(j=0;j<9;j++){
							addCell(i, j, cell);
						}
					});
				}

				settingsButton.addEventListener('click',function(){
					setClass(div, "show-settings", true);
				});

				closeSettingsButton.addEventListener('click',function(e){
					setClass(div, "show-settings", false);
					e.cancelBubble = true;
					return false;
				});

				nrc.addEventListener('click',function(){
					var valid = solution.checkAll(subdivision.NRC);
					if(!valid){
						nrc.checked = false;
						normal.checked = true;
						return;
					}
					currentKind = kind.NRC;
					setKindClass(div, currentKind);
					solution.setExtraKind(getExtraSubdivision());
				});

				normal.addEventListener('click',function(){
					currentKind = kind.NORMAL;
					setKindClass(div, currentKind);
					solution.setExtraKind(getExtraSubdivision());
				});

				revealSolutionCheckbox.addEventListener('click',function(){
					setClass(div,"reveal-solution",revealSolutionCheckbox.checked);
				});

				revealDistributionCheckbox.addEventListener('click',function(){
					setClass(div,"reveal-distribution",revealDistributionCheckbox.checked);
				});

				return {
					setSolutionValue:function(row, column, n){
						if(n){grid.rows[row][column].setValue(n);}
						setSolutionValue(row, column, n);
					}
				};
			});
})