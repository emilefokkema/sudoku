define([],function(){
	var permutator = function(n){
		this.n = n;
		this.currentParentPosition = -1;
	}
	permutator.prototype.next = function(){
		if(this.n == 1){
			return {
				value:[0],
				done:true
			};
		}else{
			var childDone;
			if(!this.childPermutator){
				this.currentParentPosition++;
				this.childPermutator = new permutator(this.n - 1);
				childDone = false;
			}
			var childNext = this.childPermutator.next();
			childDone = childNext.done;
			var value = [];
			for(var i=0;i<this.n;i++){
				if(i<this.currentParentPosition){
					value.push(childNext.value[i]);
				}else if(i == this.currentParentPosition){
					value.push(this.n - 1);
				}else{
					value.push(childNext.value[i-1]);
				}
			}
			var done = this.currentParentPosition == this.n - 1 && childDone;
			if(childDone){
				this.childPermutator = null;
			}
			return {
				value:value,
				done:done
			};
		}
	};
	
	return permutator;
})