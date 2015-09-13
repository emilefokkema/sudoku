(function(window,document){
	var maak=function(tagName){
		var node=document.createElement(tagName);
		node.html=function(s){
			node.innerHTML=s;
			return node;
		};
		return node;
	};
	var regesc=function(s){return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');};
	var getAllNodes=function(node){
		var r=[];
		var res0,nodeIterator=document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT);
		while(res0=nodeIterator.nextNode()){
			r.push(res0);
		}
		return r;
	};
	var assemble=function(assemblable, getToReturn){
		var n=assemblable[0];
		var gen=assemblable[1];
		var p;
		var obj={};
		var newOne;
		for(var i=0;i<n;i++){
			newOne=gen.apply(obj, [i, getToReturn]);
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
		if(node.childNodes.length==1&&node.childNodes[0].nodeName==='#text'&&(result=node.innerText||node.textContent)){
			return extract(result);
		}else if(result=node.getAttribute('offspring')){
			node.removeAttribute('offspring');
			return extract(result);
		}
		return null;
	};

	var expandCssRuleContent=(function(){
		var propertiesToExpand={
			"transform":["-ms-","-webkit-"],
			"transition-property":["-webkit-"],
			"transition-duration":["-webkit-"]
		};
		var valueBeginningsToExpand={
			"linear-gradient":["-webkit-","-o-","-moz-"]
		};
		var expandProperty=function(prop,val,toAdd){
			return toAdd.map(function(a){return [a+prop,val]});
		};
		var expandPropertyValue=function(prop,val,toAdd){
			return toAdd.map(function(a){return [prop,a+val]});
		};
		var mustExpandProperty=function(prop){
			return propertiesToExpand[prop];
		};
		var mustExpandValue=function(val){
			for(b in valueBeginningsToExpand){
				if(valueBeginningsToExpand.hasOwnProperty(b)&&val.match(new RegExp("^"+regesc(b)))){
					return valueBeginningsToExpand[b];
				}
			}
		};
		var parts=function(ruleContent){
			if(!ruleContent.match(/;$/)){ruleContent+=';'}
			var all,prop,val,m,p=[],rgx=/([^;:{]+?):([^;:]+?);/g,
				expandBy,
				addAll=function(things){things.map(function(pair){p.push(pair);});};
			while(m=rgx.exec(ruleContent)){
				prop=m[1].trim();
				val=m[2].trim();
				if(expandBy=mustExpandProperty(prop)){
					addAll(expandProperty(prop,val,expandBy));
				}else if(expandBy=mustExpandValue(val)){
					addAll(expandPropertyValue(prop,val,expandBy));
				}
				p.push([prop,val]);
			}
			return p;
		};
		return function(ruleContent){
			return parts(ruleContent).map(function(p){return p[0]+":"+p[1];}).join(';')+';';
		};
	})();

	console.log(expandCssRuleContent('transform:translateY(-50%);background: linear-gradient(#f6f6f6,#f0f0f0);'));

	var appendFromThingsToNode=function(node, ids, things){
		var toAppend;
		try{
			node.innerText="";
		}catch(e){}
		try{
			node.textContent="";
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
			var toAppend,match,id,style,idN,node,allNodes=getAllNodes(baseNode);
			var toReturn;
			var getToReturn=function(){return toReturn;};
			var offspringId,offspringIds;
			var things;
			if(arguments.length>2){
				things=arguments[2];
				if(isAssemblable(things)){
					things=assemble(things, getToReturn);
				}
			}
			for(var i=0;i<allNodes.length;i++){
				node=allNodes[i];
				id=node.getAttribute('id');
				style=node.getAttribute('style');
				if(style){node.setAttribute('style',expandCssRuleContent(style));}
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
	makeNode.css=expandCssRuleContent;
	window.makeNode=makeNode;
})(window,document);