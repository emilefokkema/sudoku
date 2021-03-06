define(["sudokuGrid","setClass","getSolution","subdivision","solver","makeCell","getDistribution","getPossibilities","hash"],function(sudokuGrid, setClass, getSolution, subdivision, solver, makeCell, getDistribution, getPossibilities, hash){
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
			revealSolutionCheckbox,
			revealDistributionCheckbox,
			eliminatePossibilities){
				var solution = getSolution();
				document.body.appendChild(div);
				var grid = sudokuGrid.normal();
				var currentlySelected = null;
				var currentHint = null;
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
					setClass(div, "busy", going);
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
				var setSubdivisionError = function(kind, index, bool){
					grid.subdivisions.map(function(s){
						if(s.kind == kind){
							s[index].map(function(cell){cell.setError(bool);});
						}
					});
				};
				var suggestSolutionValue = function(row, column, n){
					var objection = solution.getObjectionToAdding(row, column, n);
					if(objection){
						setSubdivisionError(objection.kind, objection.index, true);
						return function(){
							setSubdivisionError(objection.kind, objection.index, false);
						}
					}
				};
				var setPossibilities = function(){
					var possibilities = getPossibilities(solution);
					var singlePossibility = possibilities.findSinglePossiblity();
					if(currentHint){
						currentHint.hint(false);
					}
					if(singlePossibility){
						setClass(div, "has-hint", true);
						currentHint = grid.subdivisionFor(singlePossibility.kind)[singlePossibility.one][singlePossibility.indices.toArray()[0]];
						currentHint.hint(true);
					}else{
						setClass(div, "has-hint", false);
					}
				};
				var addCell = function(row, column, makeElement){
					var cell = makeCell(
						makeElement,
						function(n){return suggestSolutionValue(row, column, n);},
						function(n){
							solution.add(row, column, n);
							setPossibilities();
							solver.useSolution(solution);
							hash.write(solution.getRows());
						},
						function(){
							if(currentlySelected){
								currentlySelected.setSelected(false);
							}
							currentlySelected = cell;
							currentlySelected.setSelected(true);
						}
					);
					grid.add(row, column, cell);
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
					var valid = solution.clone().useGrid(sudokuGrid.nrc()).checkAll();
					if(!valid){
						nrc.checked = false;
						normal.checked = true;
						return;
					}
					setKindClass(div, kind.NRC);
					grid = grid.copyToGrid(sudokuGrid.nrc())
					solution.useGrid(sudokuGrid.nrc());
					setPossibilities();
					solver.useSolution(solution);
				});

				normal.addEventListener('click',function(){
					setKindClass(div, kind.NORMAL);
					grid = grid.copyToGrid(sudokuGrid.normal());
					solution.useGrid(sudokuGrid.normal());
					setPossibilities();
					solver.useSolution(solution);
				});

				revealSolutionCheckbox.addEventListener('click',function(){
					setClass(div,"reveal reveal-solution",revealSolutionCheckbox.checked);
				});

				revealDistributionCheckbox.addEventListener('click',function(){
					setClass(div,"reveal reveal-distribution",revealDistributionCheckbox.checked);
				});

				eliminatePossibilities.addEventListener('click',function(){
					var checked = eliminatePossibilities.checked;
					if(checked){
						setPossibilities();
					}
					setClass(div,"show-hint",checked);
				});

				return {
					setSolutionValue:function(row, column, n){
						if(n){grid.rows[row][column].setValue(n);}
						solution.add(row, column, n);
						solver.useSolution(solution);
					},
					suggestValueForSelected:function(n){
						if(currentlySelected){
							currentlySelected.suggestValue(n);
						}
					},
					clearCurrentlySelected:function(){
						if(currentlySelected){
							currentlySelected.clear();
						}
					},
					setPossibilities:function(){
						setPossibilities();
					},
					startSolving:function(){
						solver.useSolution(solution);
					}
				};
			});
})