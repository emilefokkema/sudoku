(function(body){
	window.getContourViewer = function(makeNode, side){
		var space = (function(){
			var sideToSvg = function(s){
				var svg = document.createElementNS('http://www.w3.org/2000/svg','path');
				svg.setAttribute('stroke','#000');
				svg.setAttribute('fill','transparent');
				svg.setAttribute('d', s.toSvgPath());
				return svg;
			};
			var makeAxis = function(x1, y1, x2, y2){
				var xAxis = document.createElementNS('http://www.w3.org/2000/svg','line');
				xAxis.setAttribute('x1',x1);
				xAxis.setAttribute('y1',y1);
				xAxis.setAttribute('x2',x2);
				xAxis.setAttribute('y2',y2);
				xAxis.setAttribute('stroke','#444');
				return xAxis;
			};
			var renderAxes = function(svg, w, h, scale, shift){
				svg.appendChild(makeAxis(0,shift,w,shift));
				svg.appendChild(makeAxis(shift, 0, shift,h));
			};
			var render = function(sides, svg, w, h){
				if(!sides.length){return;}
				var box = sides.map(function(s){return s.box();}).reduce(function(b1,b2){return b1.plus(b2);});
				var scale = Math.min(h / box.maxy, w / box.maxx) * 0.8;
				var shift = Math.min(w,h) * 0.1;
				renderAxes(svg, w, h, scale,shift);
				sides.map(function(s){
					svg.appendChild(sideToSvg(s.scale(scale).translate(shift, shift)));
				});
			};
			
			return {render:render};
		})();
		var sides = (function(){
			var all = [];
			var add = function(s){
				if(all.some(function(ss){
					return ss.isSameAs(s) || ss.overlapsWith(s);
				})){
					console.warn("got that one already");
					return;
				}
				all.push(s);
				return function(){
					remove(s);
				};
			};
			var remove = function(s){
				var index = all.indexOf(s);
				if(index != -1){
					all.splice(index,1);
				}
			};
			return {
				add:add,
				getAll:function(){return all;}
			};
		})();
		var append = function(){
			var w = 600, h = 300;
			var viewer = makeNode('<div id="1" style="width:'+w+'px;">'+
				'<div id="2" style="width:'+w+'px;height:'+h+'px;border:1pt solid #444"></div>'+
				'<div id="3" style="width:'+w+'px"></div>'+
				'</div>',
				function(container, svgContainer, controlContainer){
					body.appendChild(container);
					var makeSvg = function(){
						var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
						svg.setAttribute('width',w);
						svg.setAttribute('height',h);
						return svg;
					};
					var render = function(){
						var svg = makeSvg();
						svgContainer.innerHTML = "";
						svgContainer.appendChild(svg);
						space.render(sides.getAll(), svg, w, h);
					};
					var addSide = function(s){
						var r = sides.add(s);
						render();
						return r;
					};
					var addSideFromString = function(s){
						return addSide(side.fromString(s));
					};
					var makeAdder = function(){
						return makeNode("<div id='3'><input id='1' type='text' /><input id='2' type='button' value='add' /></div>",
							function(text, button, container){
								button.onclick = function(){
									var remove = addSideFromString(text.value);
									if(!remove){return;}
									button.onclick = function(){
										remove();
										render();
										controlContainer.removeChild(container);
									};
									button.setAttribute('value','remove');
									makeAdder();
								};
								controlContainer.appendChild(container);
							});
					};
					makeAdder();
					return {
						addSide:addSide,
						addSideFromString:addSideFromString
					};
				});
			
			return viewer;
		};
		return {append:append};
	};
})(document.body);