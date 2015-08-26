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
	var assemble=function(assemblable){
		var n=assemblable[0];
		var gen=assemblable[1];
		var p;
		var obj={};
		var newOne;
		for(var i=0;i<n;i++){
			newOne=gen(i);
			for(p in newOne){
				if(obj.hasOwnProperty(p)){
					obj[p].push(newOne[p]);
				}else{
					obj[p]=[newOne[p]];
				}
			}
		}
		return obj;
	};
	var isAssemblable=function(thing){
		return thing&&thing.length==2&&thing[0]&&!isNaN(thing[0]);
	};
	var makeAppendable=function(thing){
		var type=typeof thing;
		if(type==='string'){
			return document.createTextNode(thing);
		}else if(type==='number'){
			return document.createTextNode(thing.toString());
		}else{
			return thing;
		}
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

	var getOffspringIdentifiers=function(node){
		var rgx;
		var extract=function(text){
			var match,result=[];
			rgx=new RegExp("\\$\\(([^\\s()\\-.]+)\\)","g");
			while(match=rgx.exec(text)){
				result.push(match[1]);
			}
			if(result.length==0){return null;}
			return result;
		};
		if(node.childNodes.length==1&&node.childNodes[0].nodeName==='#text'&&(result=node.innerText)){
			return extract(result);
		}else if(result=node.getAttribute('offspring')){
			node.removeAttribute('offspring');
			return extract(result);
		}
		return null;
	};

	var appendFromThingsToNode=function(node, ids, things){
		var toAppend;
		try{
			node.innerText="";
		}catch(e){}
		ids.map(function(id){
			if(things.hasOwnProperty(id)){
				toAppend=things[id];
				if(!!toAppend.shift){
					for(var j=0;j<toAppend.length;j++){
						node.appendChild(makeAppendable(toAppend[j]));
					}
				}else{
					node.appendChild(makeAppendable(toAppend));
				}
			}
		});
	}

	var makeNode=function(html){
		var baseNode=maak('template').html(html).content.childNodes[0];
		if(arguments.length>1){
			var f=arguments[1];
			var nodesToPass=[];
			var toAppend,match,id,idN,node,allNodes=getAllNodes(baseNode);
			var toReturn;
			var offspringId,offspringIds;
			var things;
			if(arguments.length>2){
				things=arguments[2];
				if(isAssemblable(things)){
					things=assemble(things);
				}
			}
			for(var i=0;i<allNodes.length;i++){
				node=allNodes[i];
				id=node.getAttribute('id');
				if(id&&!isNaN(idN=parseInt(id))){
					nodesToPass.push({n:idN,node:node});
					node.removeAttribute('id');
				}
				if(things&&(offspringIds=getOffspringIdentifiers(node))){
					appendFromThingsToNode(node, offspringIds, things);
				}
			}
			nodesToPass=groupNodesById(nodesToPass).sort(function(a,b){return a.n-b.n;}).map(function(o){return o.node;});
			if(f&&'function'===typeof f&&(toReturn=f.apply(things?things:null, nodesToPass))){
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