(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getJoystickMaker = function(body, sender){
		return function(left, top, size){
			var thickness = size/10, color = '#666';
			var svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
			svg.setAttribute('width', size);
			svg.setAttribute('height', size);
			svg.setAttribute('style', 'position:fixed;left:'+left+'px;top:'+top+'px;');
			var outerRing = (function(svg){
				var ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
				ring.setAttribute('cx',size/2);
				ring.setAttribute('cy',size/2);
				ring.setAttribute('r',size/2 - thickness/2);
				ring.setAttribute('stroke-width', thickness);
				ring.setAttribute('fill','transparent');
				ring.setAttribute('stroke', color);
				svg.appendChild(ring);
				return ring;
			})(svg);
			var stick = (function(){
				var ring = document.createElementNS('http://www.w3.org/2000/svg','circle');
				ring.setAttribute('cx',size/2);
				ring.setAttribute('cy',size/2);
				ring.setAttribute('r',thickness);
				ring.setAttribute('fill',color);
				svg.appendChild(ring);
				var maxR = size/2 - thickness;
				var setPosition = function(x,y){
					var d = Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2));
					if(d > maxR){
						var r = maxR / d;
						x = size/2 + (x - size/2) * r;
						y = size/2 + (y - size/2) * r;
					}
					ring.setAttribute('cx',x);
					ring.setAttribute('cy',y);
				};
				return {
					setPosition:setPosition
				};
			})(svg);
			body.addEventListener('touchmove',function(e){
				var t = e.changedTouches.item(0);
				stick.setPosition(t.clientX - left, t.clientY - top);
			});
			body.addEventListener('touchend',function(){
				stick.setPosition(size/2, size/2);
			});
			return {
				svg:svg
			};
		};
	};
})();