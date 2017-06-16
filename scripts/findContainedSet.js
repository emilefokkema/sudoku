define(["numberSet"],function(numberSet){
	var reverse = function(possibilities, list){
		var indices = numberSet();
		for(var i=0;i<list.length;i++){
			if(list[i] && list[i].intersectWith(possibilities).length){
				indices.add(i);
			}
		}
		return indices;
	};
	var image = function(indices, list){
		var result = numberSet();
		indices.toArray().map(function(i){
			result = result.plus(list[i] || numberSet());
		});
		return result;
	};
	var findContainedSetOne = function(list){
		var map = numberSet.map();
		for(var two = 0;two<9;two++){
			var p = list[two] || numberSet();
			if(map.hasKey(p)){
				map.get(p).push(two);
			}else{
				map.set(p, [two]);
			}
		}
		var result;
		map.traverse(function(possibilities, indices, stop){
			var l = possibilities.length;
			var rev = reverse(possibilities, list);
			if(l  == indices.length && rev.length > l){
				result = {
					numbers:possibilities,
					indices:numberSet(indices)
				};
				stop();
			}
		});
		return result;
	};
	
	var findContainedSetTwo = function(list){
		for(var n=1;n<=9;n++){
			var where = reverse(numberSet([n]), list);
			if(where.length == 1 && image(where, list).length > 1){
				return {
					numbers:numberSet([n]),
					indices:where
				}
			}
		}
	};
	var findContainedSet = function(list){
		var result = findContainedSetOne(list);
		if(result){
			return result;
		}
		for(var i=1;i<2;i++){
			var result = findContainedSetTwo(list, i);
			if(result){
				return result;
			}
		}
	};
	return findContainedSet;
})