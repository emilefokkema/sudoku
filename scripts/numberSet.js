define([],function(){
	var arrayToNumber = function(arr){
		var n = 0;
		arr.map(function(nn){n |= (1 << nn);});
		return n;
	};
	var numberToArray = function(n){
		var result = [];
		var nn, i=0;
		while((nn = (1 << i)) <= n){
			if(n & nn){
				result.push(i);
			}
			i++;
		}
		return result;
	};
	var lengthOfNumber = function(n){
		return numberToArray(n).length;
	};
	var numberSet = function(arr){
		var n = arr ? arrayToNumber(arr) : 0;
		var self = {
			length:lengthOfNumber(n),
			getNumber:function(){return n;},
			equals:function(other){return other.getNumber() == n;},
			remove:function(nn){
				var p = 1 << nn;
				if(n & p){
					this.length--;
					n ^= p;
				}
			},
			intersectWith:function(other){
				return numberSet(numberToArray(n & other.getNumber()));
			},
			plus:function(other){
				return numberSet(numberToArray(n | other.getNumber()));
			},
			add:function(nn){
				var p = 1 << nn;
				if(!(n & p)){
					this.length++;
					n |= p;
				}
			},
			toArray:function(){return numberToArray(n);},
			contains:function(nn){return (n & (1<<nn)) > 0;}
		};
		return self;
	};
	window.numberSet = numberSet;
	return numberSet;
})