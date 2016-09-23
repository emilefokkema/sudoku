(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getSvgMazeDrawer = function(direction, timeOutWhile, contourMaker, position, setShift){
		var borderWidth = 1/4, shift = position(borderWidth/2, borderWidth/2);

		var timeOutMap = function(arr, toDo, update, done){
			var i = 0, l = arr.length;
			timeOutWhile(function(){return i < l;},function(update){
				toDo(arr[i], i);
				update((i+1)/l);
				i++;
			}, 10, done, update);
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
				x = ends.x1 - borderWidth / 2;
				width = borderWidth;
				y = Math.min(ends.y1, ends.y2) - borderWidth/2;
				height = Math.abs(ends.y2 - ends.y1) + borderWidth;
			}else{
				y = ends.y1 - borderWidth / 2;
				x = Math.min(ends.x1, ends.x2) - borderWidth/2;
				height = borderWidth;
				width = Math.abs(ends.x2 - ends.x1) + borderWidth;
			}
			return contourMaker.rectangle(x + shift.x,y + shift.y,width,height);
		};
		var getRectangleForBorderPart = function(p){
			var ends = getEndPoints(p);
			var rect = getRectangle(ends, p.direction);
			return rect;
		};

		var appendPathsFromContour = function(svg, c){
			var paths = c.makeSvgPaths(4);
			paths.map(function(p){
				var path = document.createElementNS('http://www.w3.org/2000/svg','path');
				path.setAttribute('stroke','#888');
				path.setAttribute('fill','transparent');
				path.setAttribute('d',p);
				svg.appendChild(path);
			});
		};

		var checkCreatedContour = function(contour){
			var twoSides = contour.sides.length == 2;
			var aHole = contour.sides.some(function(s){return s.area() < 0;});
			var msg = "";
			if(!twoSides){
				msg += "The created contour has "+contour.sides.length+" sides.";
			}
			if(!aHole){
				msg += "Is has no hole.";
			}
			if(msg.length > 0){
				console.warn(msg);
			}
		};

		var draw = function(actionSequence, createProgress, boxSize, drawPaths){
			
			setShift(shift.scale(boxSize));
			actionSequence.add(function(m, done, update){
				var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
				svg.setAttribute('width',boxSize * (m.maxX + borderWidth));
				svg.setAttribute('height',boxSize * (m.maxY + borderWidth));
				svg.setAttribute('style','position:fixed;');
				var contour;
				var rectangles = m.borderParts.map(function(p){
					return getRectangleForBorderPart(p);
				});
				var myDone = function(){
					contour = contour.scale(boxSize);
					appendPathsFromContour(svg, contour);
					done({
						svg:svg,
						model:m
					});
				};
				contour = contourMaker.contour.combineMany(rectangles);
				checkCreatedContour(contour);
				update(1);
				myDone();
			},createProgress("drawing svg"));
		};
		return {draw:draw}
	};
})();