(function(){
	window.mazeGame = window.mazeGame || {};

	window.mazeGame.getLevelProvider = function(){
		var currentCounter, currentBoxSize, currentGreenSpeed;
		var reset = function(){
			currentCounter = 1;
			currentBoxSize = 50;
			currentGreenSpeed = 1;
		};
		reset();
		var getNext = function(){
			var l = {
				boxSize:currentBoxSize,
				number:currentCounter,
				greenSpeed:currentGreenSpeed
			};
			if(currentCounter == 1){
				l.message = "<span>Use the arrow keys to move </span><span class='circle redcircle'> </span><span>to</span><span class='circle yellowcircle'> </span><span>before</span><span class='circle greencircle'> </span><span>gets there.</span>";
			}
			if(currentCounter % 3 == 0 && currentBoxSize > 5){
				currentBoxSize -= 3;
			}
			currentCounter++;
			//currentGreenSpeed += 1;
			return l;
		};
		return {
			getNext:getNext,
			reset:reset
		};
	};
})();