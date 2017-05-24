define(["sudokuGrid","setClass"],function(sudokuGrid, setClass){
	var kind = {
		NRC:{className:"nrc"},
		NORMAL:{className:""}
	};
	var makeCell = function(makeElement){
		return makeElement(function(input, container){
			var setError = function(val){
				setClass(container,"error",val);
			};
			return {
				setError:setError
			};
		});
	};
	var setKindClass = function(el, k){
		for(var kk in kind){
			if(kind.hasOwnProperty(kk)){
				if(kind[kk] == k){
					setClass(el, kind[kk].className, true);
				}else{
					setClass(el, kind[kk].className, false);
				}
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
				var currentKind = kind.NORMAL;

				for(var i=0;i<9;i++){
					row(function(cell){
						for(j=0;j<9;j++){
							var gridPosition;
							gridPosition = grid.add(i, j, makeCell(cell));
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
					currentKind = kind.NRC;
					setKindClass(div, currentKind);
				});

				normal.addEventListener('click',function(){
					currentKind = kind.NORMAL;
					setKindClass(div, currentKind);
				});
			});
})