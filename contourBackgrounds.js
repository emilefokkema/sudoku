(function(str){
	var sets, instructions;
	var xPath = ".//*[contains(@data-contour,'parent' ) or contains(@data-contour,'child')]";
	var toArray = function(iterator){
		var next, result = [];
		while(next = iterator.iterateNext()){
			result.push(next);
		}
		return result;
	};
	var contourChildrenOf = function(node){
		return toArray( document.evaluate(xPath, node, null, XPathResult.ANY_TYPE, null) );
	};
	var concatenate = function(a,b){return a.concat(b);};

	var contourNameOf = function(node){
		return node.getAttribute('data-contour').match(/^(?:parent|child)\s(.*)$/)[1];
	};

	var getSvgBackgroundString = function(width, height, contourInfo){
		var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
		svg.setAttribute('width',width);
		svg.setAttribute('height', height);
		svg.setAttribute('xmlns','http://www.w3.org/2000/svg');
		contourInfo.map(function(info){
			var svgPaths = info.contour.makeSvgPaths(4);
			svgPaths.map(function(pathString){
				var path = document.createElementNS('http://www.w3.org/2000/svg','path');
				path.setAttribute('stroke',info.color);
				path.setAttribute('fill','transparent');
				path.setAttribute('stroke-width','1');
				path.setAttribute('d',pathString);
				svg.appendChild(path);
			});
		});
		return "'data:image/svg+xml;utf8,"+svg.outerHTML+"'";
	};

	var getSets = function(){
		var parents = str.makeTrees(
			contourChildrenOf(document),
			function(n1, n2){
				return contourChildrenOf(n1).indexOf(n2) != -1;
			})
			.map(function(n){return str.allNodes(n);})
			.reduce(concatenate)
			.filter(function(n){return n.node.getAttribute('data-contour').indexOf("parent") != -1;});
		
		parents.map(function(p){
			var children;
			if(p.parent && (children = p.parent.children)){
				children.splice(children.indexOf(p),1);
				p.parent = null;
			}
		});
		return parents.map(function(p){
			return {
				parent: p.node,
				children: p.children.map(function(c){return str.allNodes(c);}).reduce(concatenate).map(function(c){return c.node;})
			};
		});
	};

	var draw = function(getSetsAgain){
		sets = (!getSetsAgain && sets) || getSets();

		sets.map(function(set){
			var children, parentName = contourNameOf(set.parent);
			if(instructions[parentName]){
				children = {};
				set.children.map(function(child){
					children[contourNameOf(child)] = child;
				});
				var parentRect = set.parent.getBoundingClientRect();
				var contourInfo = instructions[parentName].apply({
					getRectangle: (function(){
						return function(node){
							var clientRect = node.getBoundingClientRect();
							return contourMaker.rectangle(clientRect.left - parentRect.left, clientRect.top - parentRect.top, clientRect.width, clientRect.height);
						};
					})()
				}, [set.parent, children]);
				set.parent.style.backgroundImage = "url("+getSvgBackgroundString(parentRect.width, parentRect.height, contourInfo)+")";
				set.parent.style.backgroundRepeat = "no-repeat";
			}
		});
	
	};

	window.contourBackgrounds = function(instructions_){
		instructions = instructions_;
		draw();
		window.addEventListener('resize', function(){draw();});
		window.addEventListener('DOMNodeInserted', function(){
			draw(true);
		})
	};
	
})(window.structureHelpers);