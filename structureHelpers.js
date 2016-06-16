;(function(){
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

	var makeTrees = (function(){
		var node = function(n){
			return {
				parent: null,
				node:n,
				children: []
			};
		};

		var appendTo = function(n1, n2){
			n1.children.push(n2);
			n2.parent = n1;
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
			var subTrees = mt(nodes.filter(function(n){return n!=highest;}), isParentOf);
			subTrees.map(function(s){appendTo(highest, s);});
			return highest;
		};

		var mt = function(nodes, isParentOf){
			var groupedNodes = nodes.groupBy(function(x,y){return isParentOf(x,y) || isParentOf(y, x);});
			return groupedNodes.map(function(g){return makeTree(g, isParentOf);});
		};

		return function(nodes, isParentOf){
			isParentOf = (function(orig){
				return function(n1,n2){
					return orig(n1.node, n2.node);
				};
			})(isParentOf);
			nodes = nodes.map(function(n){return node(n);});
			return mt(nodes, isParentOf);

		};
	})();
	var allNodes = function(node){
		var result = [node];
		if(node.children.length > 0){
			result = result.concat(node.children.map(function(c){return allNodes(c);}).reduce(function(a,b){return a.concat(b);}));
		}
		return result;
	};
	var once = function(f){
		var called = false;
		return function(){
			if(!called){
				called = true;
				return f.apply(null, arguments);
			}
		};
	};
	var step = (function(){
		var s = function(execute){
			var finish = function(){};
			var exec = function(context){
				finish = execute(context || {}, function(){finish();});
				return finish || function(){};
			};
			exec.then = function(otherStep){
				return s(function(context, finish){
					var stop2 = function(){}, stop = execute(context, function(){
						stop2 = otherStep.then(s(function(){finish();}))(context);
						
					});
					return function(){
						stop2();
						(stop || function(){})();
						
					};
				});
			};
			return exec;
		};
		return s;
	})();
	var chooser = (function(){
		var sequentialSender = function(){
			var all=[], i = 0;
			var f = function(){
				if(i < all.length){
					return all[i].apply(null, arguments);
					i++;
				}
			};
			f.add = function(f_){all.push(f_);};
			return f;

		};
		var makeStep = function(sel){
			return step(function(context, finish){
				return sel(once(function(v){
					context(v);
					finish();
				}));
			});
		};
		return function(selector, send){
			var step_ = makeStep(selector);
			var context = sequentialSender();
			context.add(send);
			var exec = function(){return step_(context);}
			exec.then = function(selector_, send_){
				step_ = step_.then(makeStep(selector_));
				console.log("adding function to context");
				context.add(send_);
				return exec;
			};
			return exec;
		};
	})();
	window.structureHelpers = {
		makeTrees: makeTrees,
		allNodes: allNodes,
		chooser: chooser
	};
})();

