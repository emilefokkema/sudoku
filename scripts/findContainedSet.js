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
		var all = numberSet();
		for(var i=0;i<list.length;i++){
			if(list[i]){
				all = all.plus(list[i]);
			}
		}
		all = all.toArray();
		var map = numberSet.map();
		for(var i=0;i<all.length;i++){
			var p = numberSet([all[i]]);
			var rev = reverse(p, list);
			if(map.hasKey(rev)){
				map.get(rev).push(all[i]);
			}else{
				map.set(rev, [all[i]]);
			}
		}
		var result;
		map.traverse(function(indices, possibilities, stop){
			var l = possibilities.length;
			var im = image(indices, list);
			if(l == indices.length && im.length > l){
				result = {
					numbers:numberSet(possibilities),
					indices:indices
				};
				stop();
			}
		});
		return result;
	};
	var findContainedSet = function(list){
		return findContainedSetOne(list) || findContainedSetTwo(list);
	};
	return findContainedSet;
})