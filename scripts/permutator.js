define([],function(){
	var permutator = function(n){
		var next;
		if(n == 1){
			next = function(){
				return {
					value:[0],
					done:true
				};
			};
		}else{
			var childPermutator, childDone;
			var currentParentPosition = -1;
			next = function(){
				if(!childPermutator){
					currentParentPosition++;
					childPermutator = permutator(n - 1);
					childDone = false;
				}else{

				}
				var childNext = childPermutator.next();
				childDone = childNext.done;
				var value = childNext.value.slice(0,currentParentPosition)
							.concat([n-1])
							.concat(childNext.value.slice(currentParentPosition));
				var done = currentParentPosition == n - 1 && childDone;
				if(childDone){
					childPermutator = null;
				}
				return {
					value:value,
					done:done
				};
			};
		}
		return {
			next:next
		};

	};

	var twoPermutator = permutator(4);
	var nextValue;
	while(!(nextValue = twoPermutator.next()).done){
		console.log(nextValue.value.join(""));
	}
	console.log(nextValue.value.join(""));
})