(function(){
	window.mazeGame = window.mazeGame || {};



	window.mazeGame.getThingWalker = function(makeModule, easer, direction, mazePositionToScreenPosition, body, chooseRandom){
		var mazeWalker = function(m, startPosition){
			var currentPosition = startPosition;
			var currentDirection = chooseRandom(currentPosition.freeDirections);
			var leftOf = function(d){
				switch(d){
					case direction.RIGHT:return direction.TOP;
					case direction.TOP:return direction.LEFT;
					case direction.LEFT: return direction.BOTTOM;
					case direction.BOTTOM:return direction.RIGHT;
				}
			};
			var goInDirection = function(d){
				var next = currentPosition.neighborInDirection(d);
				currentPosition = next;
				return currentPosition;
			};
			var rightOf = function(d){
				switch(d){
					case direction.RIGHT:return direction.BOTTOM;
					case direction.BOTTOM:return direction.LEFT;
					case direction.LEFT: return direction.TOP;
					case direction.TOP:return direction.RIGHT;
				}
			};

			var doStep = function(){
				var toTheLeft = leftOf(currentDirection);
				if(currentPosition.freeDirections.indexOf(toTheLeft) != -1){
					currentDirection = toTheLeft;
				}
				while(currentPosition.freeDirections.indexOf(currentDirection) == -1){
					currentDirection = rightOf(currentDirection);
				}
				return goInDirection(currentDirection);
			};
			return {doStep:doStep};
		};

		var controllableMazeWalker = function(m, startPosition, joystick){
			console.log("joystick:",joystick);
			var currentDirection, currentPosition = startPosition, going = false;
			var goInDirection = function(d){
				if(currentPosition.freeDirections.indexOf(d) != -1){
					currentPosition = currentPosition.neighborInDirection(d);
				}
				return currentPosition;
			};
			var keyupListener = function(){
				going = false;
			};
			body.addEventListener('keyup',keyupListener);
			var keyDownListener = function(e){
				if(e.key === "ArrowUp"){
					currentDirection = direction.TOP;
				}else if(e.key === "ArrowDown"){
					currentDirection = direction.BOTTOM;
				}else if(e.key === "ArrowLeft"){
					currentDirection = direction.LEFT;
				}else if(e.key === "ArrowRight"){
					currentDirection = direction.RIGHT;
				}
				going = true;
			};
			body.addEventListener('keydown',keyDownListener);
			if(joystick){
				joystick.onSteer(function(d){
					document.body.style.backgroundColor = '#fff';
					currentDirection = d;
					going = true;
				});
				joystick.onRelease(function(){
					going = false;
				});
			}
			var doStep = function(){
				if(!going){
					return currentPosition;
				}else{
					return goInDirection(currentDirection);
				}
			};
			var removeListeners = function(){
				console.log("removing listeners");
				body.removeEventListener('keyup', keyupListener);
				body.removeEventListener('keydown', keyDownListener);
			};
			return {
				doStep:doStep,
				removeListeners:removeListeners
			};
		};

		return makeModule(function(m, setPosition, firstPosition, easiness, maxSpeed){
			var walker, makeWalker, makeEaser, _easer;

			var getNextGoal = function(){
				var p = walker.doStep();
				return mazePositionToScreenPosition(p);
			};
			var start = function(){
				walker = makeWalker(m, firstPosition);
				_easer = makeEaser(setPosition, easiness, maxSpeed, getNextGoal);
				_easer.start();
			};
			var stop = function(){
				_easer.stop();
			};
			this.expose({
				stop:stop,
				start:start
			});
			this.extend('autonomousThingWalker',function(){
				makeWalker = function(m, firstPosition){
					return mazeWalker(m, firstPosition);
				};
				makeEaser = function(setPosition, easiness, maxSpeed, getNextGoal){
					return easer.bufferEaser(setPosition, easiness, maxSpeed, getNextGoal);
				};
			});
			this.extend('controllableThingWalker',function(joystick){
				makeWalker = function(m, firstPosition){
					return controllableMazeWalker(m, firstPosition, joystick);
				};
				makeEaser = function(setPosition, easiness, maxSpeed, getNextGoal){
					return easer(setPosition, easiness, maxSpeed, getNextGoal);
				};
				stop = this.override(stop, function(){
					walker.removeListeners();
					this();
				});
				this.expose({
					stop:stop
				});
			});
		});
	};
})();