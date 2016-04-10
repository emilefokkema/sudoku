Array.prototype.groupBy = (function(){
	var group = function(key,firstMember){
		var members = [firstMember];
		return {
			key:key,
			members:members,
			add:function(o){members.push(o);}
		};
	};
	var findMemberForGroup = function(current, candidates, eq){
		var result;
		for(var i=0;i<candidates.length;i++){
			if(
				current.indexOf(candidates[i]) == -1 && 
				(
					current.some(function(c){return eq(c,candidates[i]);}) ||
					current.length == 0
				)
			){
				return candidates[i];
			}
		}
	};
	return function(keyF, keyEquals){
		if(arguments.length == 1 && arguments[0].length == 2){
			return (function(self,eq){
				var match,groups = [[]];
				while(self.length > 0){
					match = findMemberForGroup(groups[groups.length - 1], self, eq);
					if(match){
						groups[groups.length - 1].push(match);
					}else{
						match = self[0];
						groups.push([match]);
					}
					self.splice(self.indexOf(match),1);
				}
				return groups;
			})(this.map(function(x){return x;}), arguments[0]);
		}
		keyEquals = keyEquals || function(a,b){return a==b;};
		var newKey,thisKey,groups = [];
		for(var i=0;i<this.length;i++){
			thisKey = keyF(this[i]);
			newKey = true;
			for(var j=0;j<groups.length;j++){
				if(keyEquals(groups[j].key, thisKey)){
					newKey = false;
					groups[j].add(this[i]);
					break;
				}
			}
			if(newKey){
				groups.push(group(thisKey, this[i]));
			}
		}
		return groups.map(function(g){return {key:g.key,members:g.members};});
	};
})();


window.makeTrees = (function(){
	var node = function(n){
		var children = [];
		var append = function(n_){
			children.push(n_);
		};
		return {
			node:n,
			append: append,
			children: children
		};
	};

	var findHighest = function(nodes, isParentOf){
		if(nodes.length == 1){
			return nodes[0];
		}
		var highest = nodes.filter(function(n){
			var foundParent = nodes.filter(function(nn){return nn!=n && isParentOf(nn, n);});
			return foundParent.length == 0;
		});
		if(highest.length == 0){
			throw new Error("a tree structure cannot contain circles!");
		}
		if(highest.length > 1){
			throw new Error("a node cannot have more than one parent!");
		}
		return highest[0];
	};

	var makeTree = function(nodes, isParentOf){
		if(nodes.length == 1){
			return nodes[0];
		}
		var highest = findHighest(nodes, isParentOf);
		var subTrees = makeTrees(nodes.filter(function(n){return n!=highest;}), isParentOf);
		subTrees.map(function(s){highest.append(s);});
		return highest;
	};

	return function(nodes, isParentOf){
		isParentOf = (function(orig){
			return function(n1,n2){
				return orig(n1.node, n2.node);
			};
		})(isParentOf);
		var groupedNodes = nodes.map(function(n){return node(n);}).groupBy(function(x,y){return isParentOf(x,y) || isParentOf(y, x);});
		return groupedNodes.map(function(g){return makeTree(g, isParentOf);});

	};
})();

console.log(makeTrees(["a", "aa", "b"], function(a, b){return b.startsWith(a);}));
console.log(makeTrees(["a", "aa", "ab","abc","aac", "b"], function(a, b){return b.startsWith(a);}));



