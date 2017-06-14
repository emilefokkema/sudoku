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
	var numberSet = function(arr){
		var n = arr ? arrayToNumber(arr) : 0;
		return {
			getNumber:function(){return n;},
			equals:function(other){return other.getNumber() == n;},
			remove:function(nn){
				var p = 1 << nn;
				if(n & p){
					n ^= p;
				}
			},
			add:function(nn){
				n |= (1<<nn);
			},
			toArray:function(){return numberToArray(n);},
			contains:function(nn){return (n & (1<<nn)) > 0;}
		};
	};
	return numberSet;
})