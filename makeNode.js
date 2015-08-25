(function(window,document){
	var maak=function(tagName){
		var node=document.createElement(tagName);
		node.html=function(s){
			node.innerHTML=s;
			return node;
		};
		return node;
	};
	var getAllNodes=function(node){
		var r=[];
		var res0,nodeIterator=document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
		while(res0=nodeIterator.nextNode()){
			r.push(res0);
		}
		return r;
	};
	var groupNodesById=function(arr){
		var group,n,arr2=[];
		var nArr=[];
		for(var i=0;i<arr.length;i++){
			n=arr[i].n;
			if(nArr.indexOf(n)==-1){
				nArr.push(n);
				group=[arr[i]];
				for(var j=0;j<arr.length;j++){
					if(i!=j&&arr[j].n==n){
						group.push(arr[j]);
					}
				}
				if(group.length==1){
					arr2.push(group[0]);
				}else{
					arr2.push({n:group[0].n,node:group.map(function(o){return o.node;})});
				}
			}
		}
		return arr2;
	};

	var getOffspringIdentifier=function(node){
		var result;
		var extract=function(text){
			var match=new RegExp("^\\$\\(([^\\s()\\-.]+)\\)$").exec(text);
			return match?match[1]:null;
		};
		if(node.childNodes.length==1&&node.childNodes[0].nodeName==='#text'&&(result=node.innerText)){
			return extract(result);
		}else if(result=node.getAttribute('offspring')){
			node.removeAttribute('offspring');
			return extract(result);
		}
		return result;
	};

	var makeNode=function(html){
		var baseNode=maak('template').html(html).content.childNodes[0];
		if(arguments.length>1){
			var f=arguments[1];
			var nodesToPass=[];
			var toAppend,match,id,idN,node,allNodes=getAllNodes(baseNode);
			var toReturn;
			var offspringId;
			for(var i=0;i<allNodes.length;i++){
				node=allNodes[i];
				id=node.getAttribute('id');
				if(id&&!isNaN(idN=parseInt(id))){
					nodesToPass.push({n:idN,node:node});
					node.removeAttribute('id');
				}
				if((offspringId=getOffspringIdentifier(node))&&arguments.length>2&&arguments[2].hasOwnProperty(offspringId)){
					try{
						node.innerText="";
					}catch(e){}
					toAppend=arguments[2][offspringId];
					if(!!toAppend.shift){
						toAppend=toAppend.map(function(o){
							return 'string'===typeof o?document.createTextNode(o):o;
						});
						for(var j=0;j<toAppend.length;j++){
							node.appendChild(toAppend[j]);
						}
					}else if('string'===typeof toAppend){
						node.appendChild(document.createTextNode(toAppend));
					}else{
						node.appendChild(toAppend);
					}
				}

			}
			nodesToPass=groupNodesById(nodesToPass).sort(function(a,b){return a.n-b.n;}).map(function(o){return o.node;});
			if(f&&'function'===typeof f&&(toReturn=f.apply(arguments.length>1?arguments[2]:null, nodesToPass))){
				return toReturn;
			}else{
				return baseNode;
			}
		}else{
			return baseNode;
		}
	}
	window.makeNode=makeNode;
})(window,document);