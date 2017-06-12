define(["setClass"],function(setClass){
	return function(makeElement, suggestSolutionValue, setSolutionValue, select){
		return makeElement(function(input, container, revealer, distribution, overlay){
			var setError = function(val){
				setClass(container,"error",val);
			};
			var setSelected = function(val){
				setClass(container,"selected",val);
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
					removeError && removeError();
					setSolutionValue();
					inputOnFocus = '';
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
				}
			});
			input.addEventListener('focus',function(){
				setClass(container, 'selected',true);
				inputOnFocus = input.value;
			});
			input.addEventListener('blur',function(){
				setClass(container, 'selected',false);
				inputOnFocus = '';
				if(removeError){
					removeError();
					input.value = '';
				}
			});
			return {
				setError:setError,
				setSelected:setSelected,
				setValue:function(n){
					setClass(container, "empty", !n);
					input.value = n;
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
				}
			};
		});
	};
})