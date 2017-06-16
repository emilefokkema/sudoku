define([],function(){
	
	var combinationMaker = function(all, n){
		if(n > all.length){
			throw new Error("cannot choose "+n+" from "+all.length);
		}
		this.n = n;
		this.all = all;
		this.currentFirstIndex = 0;
		if(n > 1){
			this.childCombinationMaker = this.makeChild();
			this.latestChildResult = this.childCombinationMaker.next();
		}
		
	};
	combinationMaker.prototype.next = function(){
		if(this.all.length == 1){
			return {
				value:[this.all[0]],
				done:true
			};
		}else{
			var done = this.isDone();
			var value = this.makeValue();
			var result = {
				value:value,
				done:done
			};
			if(!done){
				this.proceed();
			}
			return result;
		}
	};
	combinationMaker.prototype.makeChild = function(){
		return new combinationMaker(this.all.slice(this.currentFirstIndex + 1), this.n - 1);
	};
	combinationMaker.prototype.makeValue = function(){
		var value = [this.all[this.currentFirstIndex]];
		if(this.n > 1){
			value = value.concat(this.latestChildResult.value);
		}
		return value;
	};
	combinationMaker.prototype.isDone = function(){
		var done = this.currentFirstIndex == this.all.length - this.n;
		if(this.n > 1){
			return done && this.latestChildResult.done;
		}
		return done;
	};
	combinationMaker.prototype.proceed = function(){
		if(this.n > 1){
			if(this.latestChildResult.done){
				this.currentFirstIndex++;
				this.childCombinationMaker = this.makeChild();
			}
			this.latestChildResult = this.childCombinationMaker.next();
		}else{
			this.currentFirstIndex++;
		}
	};
	window.combinationMaker = combinationMaker;
	return combinationMaker;
})