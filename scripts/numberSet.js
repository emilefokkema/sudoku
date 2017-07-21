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
			minus:function(other){
				var nResult = n;
				var otherN = other.getNumber();
				var nn,i=0;
				while((nn = (1 << i)) <= otherN){
					if((otherN & nn) && (nResult & nn)){
						nResult ^= nn;
					}
					i++;
				}
				return numberSet(numberToArray(nResult));
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
			contains:function(nn){return (n & (1<<nn)) > 0;},
			toString:function(){return this.toArray().join("");}
		};
		return self;
	};
	numberSet.map = function(){
		var all = {};

		return {
			set:function(set, something){
				all[set.getNumber()] = something;
			},
			get:function(set){
				return all[set.getNumber()];
			},
			hasKey:function(set){
				return all.hasOwnProperty(set.getNumber());
			},
			traverse:function(mapper){
				var keepGoing = true;
				for(var n in all){
					if(all.hasOwnProperty(n)){
						mapper(numberSet(numberToArray(n)), all[n], function(){keepGoing = false;});
						if(!keepGoing){
							break;
						}
					}
				}
			}
		};
	};
	return numberSet;
})