define(["setClass"],function(setClass){
	return function(makeElement, suggestSolutionValue, setSolutionValue){
		return makeElement(function(input, container, revealer){
			var setError = function(val){
				setClass(container,"error",val);
			};
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
				inputOnFocus = input.value;
			});
			input.addEventListener('blur',function(){
				inputOnFocus = '';
				if(removeError){
					removeError();
					input.value = '';
				}
			});
			return {
				setError:setError,
				setValue:function(n){
					setClass(container, "empty", !n);
					input.value = n;
				},
				setRevealerValue:function(n){
					revealer.value = n || '';
				}
			};
		});
	};
})