define(["setClass"],function(setClass){
	return function(makeElement, suggestSolutionValue, setSolutionValue, select){
		return makeElement(function(input, container, revealer, distribution, overlay){
			var setError = function(val){
				setClass(container,"error",val);
			};
			var setSelected = function(val){
				setClass(container,"selected",val);
				if(!val){
					inputOnFocus = '';
					if(removeError){
						clear();
					}
				}else{
					inputOnFocus = input.value;
				}
			};
			var clear = function(){
				removeError && removeError();
				setSolutionValue();
				input.value = '';
				inputOnFocus = '';
				setClass(container, "empty", true);
			};
			overlay.addEventListener('mousedown', select);
			var inputOnFocus,removeError;
			input.addEventListener('keyup',function(){
				setClass(container, "empty", !input.value);
				if(input.value == inputOnFocus){
					removeError && removeError();
					return;
				}
				if(!input.value){
					clear();
					return;
				}
				var match = input.value.match(/^[1-9]$/);
				if(!match){
					setError(true);
					removeError = function(){setError(false);};
					return;
				}
				removeError && removeError();
				var inputtingValue = parseInt(input.value);
				removeError = suggestSolutionValue(inputtingValue);
				if(!removeError){
					setSolutionValue(inputtingValue);
					inputOnFocus = input.value;
				}
			});
			input.addEventListener('focus',function(){
				setSelected(true);
			});
			input.addEventListener('blur',function(){
				setSelected(false);
			});
			return {
				setError:setError,
				setSelected:setSelected,
				setValue:function(n){
					setClass(container, "empty", !n);
					input.value = n;
				},
				suggestValue:function(n){
					removeError && removeError();
					input.value = n;
					setClass(container, "empty", false);
					removeError = suggestSolutionValue(n);
					if(!removeError){
						setSolutionValue(n);
					}
				},
				setRevealerValue:function(n){
					revealer.innerHTML = n || '';
				},
				setDistribution:function(entries){
					if(entries.length > 1){
						distribution.innerHTML = entries.map(function(e){return e.n;}).join("");
					}else{
						distribution.innerHTML = "";
					}
				},
				clear:function(){
					removeError && removeError();
					setSolutionValue();
					input.value = '';
					inputOnFocus = '';
					setClass(container, "empty", true);
				}
			};
		});
	};
})