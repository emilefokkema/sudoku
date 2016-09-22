(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getSvgMazeDrawer = function(direction, timeOutWhile, contourMaker){
		var borderWidth = 1/5;
		var timeOutMap = function(arr, toDo, update, done){
			var i = 0, l = arr.length;
			timeOutWhile(function(){return i < l;},function(update){
				toDo(arr[i], i);
				update((i+1)/l);
				i++;
			}, 30, done, update);
		};
		var getEndPoints = function(p){
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
			return {x1:x1,y1:y1,x2:x2,y2:y2};
		};
		var getRectangle = function(ends, dir){
			var x,y,width,height;
			if(dir == direction.LEFT || dir == direction.RIGHT){
				if(ends.x1 == 0){
					x = 0;
				}else{
					x = ends.x1 - 1/5;
				}
				width = borderWidth;
				y = Math.min(ends.y1, ends.y2);
				height = Math.abs(ends.y2 - ends.y1);
			}else{
				if(ends.y1 == 0){
					y = 0;
				}else{
					y = ends.y1 - 1/5;
				}
				x = Math.min(ends.x1, ends.x2);
				height = borderWidth;
				width = Math.abs(ends.x2 - ends.x1);
			}
			return contourMaker.rectangle(x,y,width,height);
		};
		var addForBorderPart = function(svg, p, m, boxSize){
			var ends = getEndPoints(p);
			var rect = getRectangle(ends, p.direction).scale(boxSize);
			var box = rect.box();
			var l = document.createElementNS('http://www.w3.org/2000/svg','rect');
			l.setAttribute('x',box.minx);
			l.setAttribute('y',box.miny);
			l.setAttribute('width',box.maxx - box.minx);
			l.setAttribute('height',box.maxy - box.miny);
			l.setAttribute('stroke','#999');
			l.setAttribute('fill','#111');
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