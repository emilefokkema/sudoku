define(["sudokuGrid","setClass","solution","subdivision","solver","makeCell"],function(sudokuGrid, setClass, solution, subdivision, solver, makeCell){
	var kind = {
		NRC:{className:"nrc"},
		NORMAL:{className:""}
	};
	
	var setKindClass = function(el, k){
		for(var kk in kind){
			if(kind.hasOwnProperty(kk)){
				setClass(el, kind[kk].className, kind[kk] == k);
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
			solverStateDiv){
				document.body.appendChild(div);
				var grid = new sudokuGrid();
				solver.onStartStopping(function(going){
					setClass(solverStateDiv, "no-solution", false);
					setClass(solverStateDiv, "one-solution", false);
					setClass(solverStateDiv, "many-solutions", false);
					setClass(solverStateDiv, "busy", going);
					var number = solver.getNumberOfSolutions();
					if(number == 0){
						if(!going){
							setClass(solverStateDiv, "no-solution", true);
						}
					}else if(number == 1){
						setClass(solverStateDiv, "one-solution", true);
					}else{
						setClass(solverStateDiv, "many-solutions", true);
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

				return {
					setSolutionValue:function(row, column, n){
						if(n){grid.rows[row][column].setValue(n);}
						setSolutionValue(row, column, n);
					}
				};
			});
})