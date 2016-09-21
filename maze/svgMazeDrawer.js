(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getSvgMazeDrawer = function(direction, timeOutWhile){
		var timeOutMap = function(arr, toDo, update, done){
			var i = 0, l = arr.length;
			timeOutWhile(function(){return i < l;},function(update){
				toDo(arr[i], i);
				update((i+1)/l);
				i++;
			}, 30, done, update);
		};
		var addForBorderPart = function(svg, p, m, boxSize){
			var x1, y1, x2, y2;
			if(p.direction == direction.TOP){
				x1 = p.x; x2 = p.x + p.length; y1 = y2 = p.y;
			}else if(p.direction == direction.BOTTOM){
				x1 = p.x + 1 - p.length; x2 = p.x + 1; y1 = y2 = p.y + 1;
			}else if(p.direction == direction.LEFT){
				y1 = p.y + 1; y2 = p.y + 1 - p.length; x1 = x2 = p.x;
			}else if(p.direction == direction.RIGHT){
				y1 = p.y; y2 = p.y + p.length; x1 = x2 = p.x + 1;
			}
			var l = document.createElementNS('http://www.w3.org/2000/svg','line');
			l.setAttribute('x1',x1*boxSize);
			l.setAttribute('y1',y1*boxSize);
			l.setAttribute('x2',x2*boxSize);
			l.setAttribute('y2',y2*boxSize);
			l.setAttribute('stroke','#999');
			svg.appendChild(l);
		};

		var draw = function(actionSequence, createProgress, boxSize, drawPaths){
			

			actionSequence.add(function(m, done, update){
				var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
				svg.setAttribute('width',boxSize * m.maxX);
				svg.setAttribute('height',boxSize * m.maxY);
				svg.setAttribute('style','position:fixed;');

				timeOutMap(m.borderParts, function(p){
					addForBorderPart(svg, p, m, boxSize);
				}, update,function(){
					done({
						svg:svg,
						model:m
					});
				});
				
			},createProgress("drawing svg"));
		};
		return {draw:draw}
	};
})();