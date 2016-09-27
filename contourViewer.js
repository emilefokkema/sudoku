(function(body){
	window.getContourViewer = function(makeNode, side, copySet){
		Array.prototype.first = function(test){
			var res, found = false;
			for(var i=0;i<this.length;i++){
				if(test(res = this[i])){
					found = true;
					break;
				}
			}
			if(found){
				return res;
			}
			return null;
		};
		var space = (function(){
			var arrowBetween = function(from, to, color, hasAccent){
				var point = from.plus(to).scaleInv(2);
				var left = point.plus(from.minus(to).rot(Math.PI/8).unit().scale(hasAccent ? 8 : 4));
				var right = point.plus(from.minus(to).rot(-Math.PI/8).unit().scale(hasAccent ? 8 : 4));
				var svg = document.createElementNS('http://www.w3.org/2000/svg','path');
				svg.setAttribute('d','M'+left.x+' '+left.y+' L '+point.x+' '+point.y+' L '+right.x+' '+right.y);
				svg.setAttribute('stroke-width',hasAccent ? 4 : 2);
				svg.setAttribute('fill','transparent');
				svg.setAttribute('stroke',color);
				return svg;
			};
			var arrowsForSide = function(s, color, hasAccent){
				var result = [];
				s.follow(function(ss){
					result.push(arrowBetween(ss.from, ss.to, color, hasAccent));
				});
				return result;
			};
			var pointsForSide = function(s, color, hasAccent){
				var result = [];
				s.follow(function(ss){
					var svg = document.createElementNS('http://www.w3.org/2000/svg','circle');
					svg.setAttribute('cx', ss.to.x);
					svg.setAttribute('cy', ss.to.y);
					svg.setAttribute('r', hasAccent ? 6 : 3);
					svg.setAttribute('fill',color);
					result.push(svg);
				});
				return result;
			};
			var sideToSvg = function(s, color, hasAccent){
				var svg = document.createElementNS('http://www.w3.org/2000/svg','path');
				svg.setAttribute('stroke',color);
				svg.setAttribute('stroke-width',hasAccent ? 4 : 2);
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
				xAxis.setAttribute('stroke','#666');
				return xAxis;
			};
			var renderAxes = function(svg, w, h, scale, origin){
				svg.appendChild(makeAxis(0,origin.y,w,origin.y));
				svg.appendChild(makeAxis(origin.x, 0, origin.x,h));
			};
			var getViewBox = function(sides){
				var box = sides.map(function(s){return s.side.box();}).reduce(function(b1,b2){return b1.plus(b2);});
				if(box.minx > 0){
					box = box.expand({left:box.minx});
				}
				if(box.maxx < 0){
					box = box.expand({right:-box.maxx})
				}
				if(box.miny > 0){
					box = box.expand({top:box.miny});
				}
				if(box.maxy < 0){
					box = box.expand({bottom:-box.maxy})
				}
				var ext = 0.1;
				var wExtension = (box.maxx - box.minx) * ext;
				var hExtension = (box.maxy - box.miny) * ext;
				box = box.expand({left:wExtension/2,right:wExtension/2,top:hExtension/2,bottom:hExtension/2});
				return box;
			};
			var getZero = function(length, left, right){
				return length * (Math.abs(left) / (right - left));
			};
			var renderSide = function(svg, s, scale, origin, hasAccent){
				var color = s.color;
				s = s.side.scale(scale).translate(origin.x, origin.y);
				svg.appendChild(sideToSvg(s, color, hasAccent));
				pointsForSide(s, color, hasAccent).map(function(c){
					svg.appendChild(c);
				});
				arrowsForSide(s, color, hasAccent).map(function(c){
					svg.appendChild(c);
				});
			};
			var render = function(sides, svg, w, h, sideWithAccent){
				if(!sides.length){return;}
				var box = getViewBox(sides);
				var scale = Math.min(h / (box.maxy - box.miny), w / (box.maxx - box.minx));
				var origin = {
					x: getZero(w, box.minx, box.maxx),
					y: getZero(h, box.miny, box.maxy)
				};

				renderAxes(svg, w, h, scale,origin);
				sides.filter(function(s){return s.side != sideWithAccent;}).map(function(s){
					renderSide(svg, s, scale, origin, false);
				});
				sides.filter(function(s){return s.side == sideWithAccent;}).map(function(s){
					renderSide(svg, s, scale, origin, true);
				});
			};
			
			return {render:render};
		})();
		var sides = (function(){
			var colorProvider = (function(){
				var cur = 0;
				var next = function(){
					var c = "hsl("+cur+",75%,50%)";
					cur += 30;
					return c;
				};
				return {next:next};
			})();
			var copies, all;
			var clear = function(){
				copies = copySet([],function(s){
					return {
						side:s,
						color:colorProvider.next()
					};
				});
				all = [];
			};
			
			var add = function(s){
				var already = all.first(function(ss){
					return ss.isSameAs(s) || ss.overlapsWith(s);
				});
				if(already){
					console.warn("got that one already");
					return {already:already};
				}
				all.push(s);
				var copy = copies.addFor(s);
				var r = function(){
					remove(s);
				};
				return {remove:r,color:copy.color};
			};
			var remove = function(s){
				var index = all.indexOf(s);
				if(index != -1){
					all.splice(index,1);
					copies.removeFor(s);
				}
			};
			
			clear();
			return {
				add:add,
				getAll:function(){return copies.allCopies();},
				clear:clear
			};
		})();
		var append = function(){
			var w = 600, h = 300;
			var viewer = makeNode('<div id="1" style="width:'+w+'px;">'+
				'<div id="2" style="width:'+w+'px;height:'+h+'px;border:1pt solid #444;background-color:#eee"></div>'+
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
					var render = function(sideWithAccent){
						var svg = makeSvg();
						svgContainer.innerHTML = "";
						svgContainer.appendChild(svg);
						space.render(sides.getAll(), svg, w, h, sideWithAccent);
					};
					var addSide = function(s){
						var r = sides.add(s);
						if(r.already){
							render(r.already)
						}else{
							render(s);
						}
						return r;
					};
					var addSideFromString = function(s){
						return addSide(side.fromString(s));
					};
					var makeAdder = function(){
						return makeNode("<div id='3'><input id='1' type='text' /><input id='2' type='button' value='add' /></div>",
							function(text, button, container){
								button.onclick = function(){
									var result = addSideFromString(text.value);
									if(!result.remove){return;}
									button.onclick = function(){
										result.remove();
										render();
										controlContainer.removeChild(container);
									};
									button.setAttribute('value','remove');
									text.style.color = result.color;
									makeAdder();
								};
								controlContainer.appendChild(container);
							});
					};
					var clear = function(){
						sides.clear();
						render();
					};
					makeAdder();
					return {
						addSide:addSide,
						addSideFromString:addSideFromString,
						clear:clear
					};
				});
			
			return viewer;
		};
		return {append:append};
	};
})(document.body);