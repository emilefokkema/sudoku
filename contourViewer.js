(function(body){
	window.getContourViewer = function(makeNode, side){
		var space = (function(){
			var sideToSvg = function(s){
				var svg = document.createElementNS('http://www.w3.org/2000/svg','path');
				return svg;
			};
			var render = function(sides, svg, w, h){
				var box = sides.map(function(s){return s.box();}).reduce(function(b1,b2){return b1.plus(b2);});
				var scale = Math.min(h / box.maxy, w / box.maxx);
				sides.map(function(s){
					svg.appendChild(sideToSvg(s.scale(scale)));
				});
			};
			
			return {render:render};
		})();
		var sides = (function(){
			var all = [];
			var add = function(s){
				all.push(s);
			};
			return {
				add:add,
				getAll:function(){return all;}
			};
		})();
		var append = function(){
			var w = 500, h = 300;
			var viewer = makeNode('<div id="1" style="width:'+w+'px;"><div id="2" style="width:'+w+'px;height:'+h+'px"></div></div>',
				function(container, svgContainer){
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
						sides.add(s);
						render();
					};
					return {
						addSide:addSide
					};
				});
			viewer.addSide(side.fromString("(0,0)-->(0,0.25)-->(12.25,0.25)-->(12.25,0)-->(0,0)"));
			return viewer;
		};
		return {append:append};
	};
})(document.body);