define(["sudokuGrid","setClass","getSolution","subdivision","getSolver"],function(sudokuGrid, setClass, getSolution, subdivision, getSolver){
	var kind = {
		NRC:{className:"nrc"},
		NORMAL:{className:""}
	};
	var makeCell = function(makeElement, suggestSolutionValue, setSolutionValue){
		return makeElement(function(input, container){
			var setError = function(val){
				setClass(container,"error",val);
			};
			var inputtingValue, inputValid, removeError;
			input.addEventListener('keyup',function(){
				if(!input.value){
					removeError && removeError();
					inputValid = false;
					setSolutionValue();
					return;
				}
				var match = input.value.match(/^[1-9]$/);
				if(!match){
					setError(true);
					removeError = function(){setError(false);};
					return;
				}
				inputtingValue = parseInt(input.value);
				removeError = suggestSolutionValue(inputtingValue);
				if(!removeError){
					inputValid = true;
				}
			});
			input.addEventListener('blur',function(){
				if(inputValid){
					setSolutionValue(inputtingValue);
				}else{
					input.value = '';
				}
				removeError && removeError();
			});
			return {
				setError:setError
			};
		});
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
			normal){
				document.body.appendChild(div);
				var grid = new sudokuGrid();
				var solution = getSolution();
				var solver = getSolver(solution);
				var currentKind = kind.NORMAL;
				var setSubdivisionError = function(kind, index, bool){
					grid.subdivisions.map(function(s){
						if(s.kind == kind){
							s[index].map(function(cell){cell.setError(bool);});
						}
					});
				};
				var addCell = function(row, column, makeElement){
					var setSolutionValue = function(n){
						solution.add(row, column, n);
					};
					var suggestSolutionValue = function(n){
						var objection = solution.getObjectionToAdding(row, column, n, currentKind == kind.NRC ? subdivision.NRC : null);
						if(objection){
							setSubdivisionError(objection.kind, objection.index, true);
							return function(){
								setSubdivisionError(objection.kind, objection.index, false);
							}
						}
					};
					grid.add(row, column, makeCell(makeElement, suggestSolutionValue, setSolutionValue));
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
				});

				normal.addEventListener('click',function(){
					currentKind = kind.NORMAL;
					setKindClass(div, currentKind);
				});
			});
})