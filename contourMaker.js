;(function(){
	window.contourMaker = (function(){
		Array.prototype.groupBy = (function(){
			var group = function(key,firstMember){
				var members = [firstMember];
				return {
					key:key,
					members:members,
					add:function(o){members.push(o);}
				};
			};
			return function(keyF, keyEquals){
				keyEquals = keyEquals || function(a,b){return a==b;};
				var newKey,thisKey,groups = [];
				for(var i=0;i<this.length;i++){
					thisKey = keyF(this[i]);
					newKey = true;
					for(var j=0;j<groups.length;j++){
						if(keyEquals(groups[j].key, thisKey)){
							newKey = false;
							groups[j].add(this[i]);
							break;
						}
					}
					if(newKey){
						groups.push(group(thisKey, this[i]));
					}
				}
				return groups.map(function(g){return {key:g.key,members:g.members};});
			};
		})();
		var point = function(x,y){
			return {
				minus:function(p){return point(x-p.x,y-p.y);},
				plus:function(p){return point(x+p.x,y+p.y);},
				cross:function(p){return x*p.y - y*p.x;},
				scale:function(r){return point(r*x, r*y);},
				matrix:function(a,b,c,d){return point(a*x+b*y,c*x+d*y);},
				mod:function(){return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));},
				dot:function(p){return x*p.x+y*p.y;},
				rot:function(alpha){return point(x*Math.cos(alpha)-y*Math.sin(alpha), y*Math.cos(alpha)+x*Math.sin(alpha));},
				projectOn:function(p){
					return p.scale(this.dot(p)/p.mod());
				},
				angleLeftFromXAxis:function(){
					if(x==0){
						if(y==0){
							return Infinity;
						}else if(y > 0){
							return Math.PI/2;
						}else if(y < 0){
							return 3*Math.PI/2;
						}
					}else if(x < 0){
						return Math.PI + Math.atan(y/x);
					}else if(x > 0){
						return Math.atan(y/x) + (y < 0 ? 2*Math.PI : 0);
					}
				},
				angleLeftFrom:function(p){
					var xPart = this.projectOn(p);
					var yPart = this.minus(xPart);
					var xSign = this.dot(p) >= 0 ? 1 : -1;
					var ySign = this.cross(p) < 0 ? 1 : -1;
					return point(xPart.mod() * xSign, yPart.mod() * ySign).angleLeftFromXAxis();
				},
				x:x,
				y:y,
				equals:function(p){
					return this == p || this.minus(p).mod()==0;
				},
				toString:function(){return "("+x+","+y+")";},
				isBetween: function(p1,p2){
					return this.minus(p1).dot(this.minus(p2)) <= 0;
				},
				isStrictlyBetween:function(p1,p2){
					return !this.equals(p1) && !this.equals(p2) && this.isBetween(p1,p2);
				},
				sameDirectionAs:function(p){
					return this.cross(p) == 0 && this.dot(p) > 0;
				},
				distanceFromSegment:function(p1,p2){
					var segment = p2.minus(p1);
					if(this.minus(p1).dot(segment) * this.minus(p2).dot(segment) > 0){
						return Math.min(this.minus(p1).mod(), this.minus(p2).mod());
					}else{
						var projectionOnSegment = this.projectOn(segment);
						return this.minus(projectionOnSegment).mod();
					}
				}
			};
		};

		window.point = point;

		var intersectSegments = function(p1,p2,q1,q2){
			var x1 = p2.minus(p1);
			var x2 = q2.minus(q1);
			var cross = x2.cross(x1);
			if(cross==0){
				if(p1.minus(q1).cross(x1)==0){
					var res=[];
					if(p1.isBetween(q1,q2) && res.indexOf(p1)==-1){
						res.push(p1);
					}
					if(p2.isBetween(q1,q2) && res.indexOf(p2)==-1){
						res.push(p2);
					}
					if(q1.isBetween(p1,p2) && res.indexOf(q1)==-1){
						res.push(q1);
					}
					if(q2.isBetween(p1,p2) && res.indexOf(q2)==-1){
						res.push(q2);
					}
					return res;
				}else{
					return [];
				}
			}else{
				var st = q1.minus(p1).matrix(-x2.y, x2.x, -x1.y, x1.x).scale(1/cross);
				if(st.x>1||st.y>1||st.x<0||st.y<0){
					return [];
				}else{
					return [p1.plus(p2.minus(p1).scale(st.x))];
				}
			}
			
		};
		
		var side = function(p1,p2){
			var ret,prev,next;
			var follow = function(callback){
				var had=[];
				var notBroken = true;
				for(var s=ret;s&&had.indexOf(s)==-1&&notBroken;s=s.next()){
					callback(s, function(){notBroken=false;});
					had.push(s);
				}
			};
			var change = function(newPoint){
				var builder = sideBuilder(newPoint(ret.from));
				follow(function(s){
					builder = builder.to(newPoint(s.to));
				});
				return builder.close();
			};
			ret= {
				from:p1,
				to:p2,
				next:function(s, notBack){
					if(!s){
						return next;
					}
					next = s;
					if(!notBack){
						s.prev(this,true);
					}
					return s;
				},
				prev:function(s, notBack){
					if(!s){
						return prev;
					}
					prev = s;
					if(!notBack){
						s.next(this,true);
					}
					return s;
				},
				addPoint:function(p){
					var newSide = side(this.from, p).next(side(p,this.to)).next(next);
					prev.next(newSide.prev().prev());
					return newSide;
				},
				eliminate:function(){
					prev.next(next);
				},
				clean:function(){
					var toKeep = this.find(function(s){return !s.to.equals(s.from);});
					var toEliminate = [];
					follow(function(s){
						if(s.to.equals(s.from)){
							toEliminate.push(s);
						}
					});
					toEliminate.map(function(s){s.eliminate();});
					return toKeep;
				},
				addPoints:function(arr){
					arr.sort(function(a,b){return a.minus(ret.from).mod() - b.minus(ret.from).mod();});
					var currentPart = this;
					arr.map(function(p){
						currentPart = currentPart.addPoint(p).prev();
					});
				},
				close:function(){
					var beginning = this;
					while(beginning.prev()){
						beginning = beginning.prev();
					}
					beginning.prev(this);
					return this;
				},
				toString:function(){return "from "+this.from.toString()+" to "+this.to.toString();},
				follow:follow,
				translate:function(x,y){
					var by = point(x,y);
					return change(function(p){
						return p.plus(by);
					});
				},
				scale:function(r){
					return change(function(p){return p.scale(r);});
				},
				rot:function(alpha){
					return change(function(p){return p.rot(alpha);});
				},
				clone:function(){
					return change(function(p){return p;});
				},
				intersectWith:function(s){
					return intersectSegments(this.from, this.to, s.from, s.to);
				},
				isSameAs:function(other){
					var result = false;
					follow(function(s){
						if(s==other){
							result = true;
						}
					});
					return result;
				},
				findSmallest:function(quant){
					var res,newQuant,currentQuant;
					follow(function(s){
						newQuant = quant.apply(null,[s]);
						if(!currentQuant){
							currentQuant = newQuant;
							res = s;
						}else{
							if(newQuant <= currentQuant){
								currentQuant = newQuant;
								res = s;
							}
						}
					});
					return res;
				},
				find:function(condition){
					var res = null;
					follow(function(s){
						if(condition(s)){
							res = s;
						}
					});
					return res;
				},
				area:function(){
					var a = 0;
					follow(function(s){
						a += (s.to.x - s.from.x)*(s.from.y + s.to.y)/2
					});
					return a;
				},
				goesAround:function(p){
					if(this.containsPoint(p)){
						return false;
					}
					var x1,x2,dangle,angle = 0;
					follow(function(s){
						x1 = s.from.minus(p);
						x2 = s.to.minus(p);
						dangle = Math.asin(Math.min(1, Math.max(x1.cross(x2)/(x1.mod()*x2.mod()), -1)));
						if(x1.dot(x2) < 0){
							if(dangle > 0){
								dangle = Math.PI - dangle;
							}else{
								dangle = -Math.PI - dangle;
							}
						}
						if(isNaN(angle) || isNaN(dangle)){
							console.log("wow")
						}
						angle += dangle;
					});
					return Math.abs(angle) > 0.01;
				},
				overlapsWith:function(other){
					var res=true;
					follow(function(s){
						if(!other.find(function(t){return t.from.equals(s.from) && t.to.equals(s.to);})){
							res = false;
						}
					});
					other.follow(function(s){
						if(!ret.find(function(t){return t.from.equals(s.from) && t.to.equals(s.to);})){
							res = false;
						}
					});
					return res;
				},
				containsPoint:function(p){
					var res = false;
					follow(function(s){
						if(s.sideContainsPoint(p)){
							res = true;
						}
					});
					return res;
				},
				toString:function(){
					var s="";
					follow(function(ss){
						s += ss.from.toString()+"-->"+ss.to.toString();
					});
					return s;
				},
				sideContainsPoint:function(p){
					return this.from.equals(p) || this.to.equals(p) || (this.from.minus(p).cross(this.to.minus(p)) == 0 && p.isBetween(this.from, this.to));
				},
				reverse:function(){
					var last,snext,res;
					follow(function(s){
						snext = s.next();
						if(!res){
							last = side(snext.to, snext.from);
							res = last;
						}else{
							res = res.prev(side(snext.to, snext.from));
						}
						
					});
					return res.prev(last);
				},
				lastPointBefore:function(p){
					var found = this.find(function(s){
						return s.sideContainsPoint(p) && !s.from.equals(p);
					});
					if(found == null){
						found = this.findSmallest(function(s){
							return s.from.equals(p) ? 100 : p.distanceFromSegment(s.from, s.to);
						});
					}
					return found.from;
				},
				firstPointAfter:function(p){
					var found = this.find(function(s){
						return s.sideContainsPoint(p) && !s.to.equals(p);
					});
					if(found == null){
						found = this.findSmallest(function(s){
							return s.to.equals(p) ? 100 : p.distanceFromSegment(s.from, s.to);
						});
					}
					return found.to;
				}
			};
			return ret;
		};
		var sideBuilder = function(from, side_){
			var to;
			if(!side_){
				to = function(p){
					return sideBuilder(p, side(from, p))
				};
			}else{
				to = function(p){
					return sideBuilder(p, side_.next(side(from, p)))
				}
			}
			return {
				to:to,
				close:function(){
					return side_.close();
				}
			};
		};
		var pathSet = function(){
			var paths = [];
			var contains = function(s){
				return paths.some(function(t){
					return t.isSameAs(s) || t.overlapsWith(s);
				});
			};
			var add = function(s){
				if(!contains(s)){
					paths.push(s);
				}
			};
			var addMany = function(ss){
				ss.map(function(s){
					add(s);
				});
			};
			return {
				add:function(s){
					add(s);
					return this;
				},
				addMany:function(ss){
					addMany(ss);
					return this;
				},
				filter:function(condition){
					paths = paths.filter(condition);
				},
				paths:paths,
				contains:contains
			};
		};
		
		var combine = (function(){
			var sideFrom = function(p, toSearch){
				return toSearch.find(function(s){return s.from.equals(p);});
			};

			var combinePairs = function(halfIntersections){
				
			};
			var intersectionProfile = function(alreadyPresent){
				alreadyPresent = alreadyPresent || [];
				var branches = {
					oneIn : 0,
					oneOut :1,
					twoIn: 2,
					twoOut :3
				};
				var r = {};
				if(alreadyPresent.length == 4){
					r.isSeparable = function(){
						return (alreadyPresent.indexOf(branches.oneIn) + alreadyPresent.indexOf(branches.twoOut)) % 2 ==1;
					};
				}
				for(var p in branches){
					if(branches.hasOwnProperty(p)){
						if(alreadyPresent.indexOf(branches[p]) == -1){
							r[p] = (function(pp){
								return function(){
									return intersectionProfile(alreadyPresent.concat([branches[pp]]));
								};
							})(p);
						}
					}
				}
				return r;
			};
			var intersection = (function(){
				
				var isSeparable = function(fromOne, toOne, fromTwo, toTwo){
					if(fromOne.sameDirectionAs(fromTwo) || toOne.sameDirectionAs(toTwo)){
						return false;
					}
					var inACircle = [fromOne, toOne, fromTwo, toTwo].sort(function(a,b){return a.angleLeftFromXAxis() - b.angleLeftFromXAxis();});
					var profile = intersectionProfile();
					inACircle.map(function(p){
						if(p == fromOne){
							profile = profile.oneIn();
						}else if(p == toOne){
							profile = profile.oneOut();
						}else if(p == fromTwo){
							profile = profile.twoIn();
						}else if(p == toTwo){
							profile = profile.twoOut();
						}
					});
					
					return profile.isSeparable();
				};
				var isPureIntersection = function(p, s, t){
					return p.isStrictlyBetween(s.from, s.to) && p.isStrictlyBetween(t.from, t.to);
				};

				var simpleIntersection = function(p, s, t){
					return {
						toBeSwitched: true,
						point:p,
						one:s,
						two:t
					};
				};
				
				return function(p, s, t){
					var fromOne, toOne, fromTwo, toTwo;
					if(isPureIntersection(p,s,t)){
						return simpleIntersection(p, s, t);
					};
					fromOne = s.lastPointBefore(p).minus(p);
					toOne = s.firstPointAfter(p).minus(p);
					fromTwo = t.lastPointBefore(p).minus(p);
					toTwo = t.firstPointAfter(p).minus(p);
					if(isSeparable(fromOne, toOne, fromTwo, toTwo)){
						return simpleIntersection(p, s, t);
					}
					var fromSplit = !fromOne.sameDirectionAs(fromTwo);
					var toSplit = !toOne.sameDirectionAs(toTwo);
					var toBeSwitched = false;
					if(fromSplit && !toSplit){
						toBeSwitched = fromTwo.angleLeftFrom(toTwo) > fromOne.angleLeftFrom(toTwo);
					}
					if(toSplit && !fromSplit){
						toBeSwitched = toTwo.angleLeftFrom(fromTwo) < toOne.angleLeftFrom(fromTwo);
					}
					return {
						toBeSwitched: toBeSwitched,
						point: p,
						one: s,
						two: t,
						fromSplit: !fromOne.sameDirectionAs(fromTwo),
						toSplit: !toOne.sameDirectionAs(toTwo),
						fromOne:fromOne,
						toOne:toOne,
						fromTwo:fromTwo,
						toTwo:toTwo
					};
				};
			})();

			var getSwitchableIntersections = function(s1, s2){
				var newIntersections,intersections = [];
				s1.follow(function(s){
					s2.follow(function(t){
						newIntersections = s.intersectWith(t).map(function(p){
							return intersection(p, s, t);
						}).filter(function(i){
							return !intersections.some(function(j){
								return i.point.equals(j.point);
							});
						});
						intersections = intersections.concat(newIntersections);
					});
				});
				combinePairs(intersections.filter(function(i){return !i.toBeSwitched;}));
				return intersections.filter(function(i){return i.toBeSwitched;});
			};
			return function(s1,s2){
				var s1Original = s1;
				var s2Original = s2;
				s1 = s1.clone();
				s2 = s2.clone();
				var intersections = getSwitchableIntersections(s1, s2);
				if(intersections.length==0){
					return [s1Original,s2Original];
				}
				var resultingPaths = pathSet();
				var addPoints = function(g){
					g.key.addPoints(g.members.map(function(m){return m.point;}));
				};
				intersections.groupBy(function(i){return i.one;}).map(addPoints);
				intersections.groupBy(function(i){return i.two;}).map(addPoints);
				
				s1 = s1.clean();
				s2 = s2.clean();
				var pairsToSwitch = intersections.map(function(i){
					var fromOne = sideFrom(i.point, s1);
					var fromTwo = sideFrom(i.point, s2);
					return {
						fromOne:fromOne,
						fromTwo:fromTwo,
						fromOnePrev:fromOne.prev(),
						fromTwoPrev:fromTwo.prev()
					};
				});
				pairsToSwitch.map(function(p){
					p.fromOnePrev.next(p.fromTwo);
					p.fromTwoPrev.next(p.fromOne);
				});
				pairsToSwitch.map(function(p){
					resultingPaths.add(p.fromOne);
					resultingPaths.add(p.fromTwo);
				});
				
				return resultingPaths.paths;
			};
		})();

		var combineMany = function(sides, doneCombining){
			doneCombining = doneCombining || pathSet();
			console.log(sides.length);
			var result = pathSet();
			if(sides.length == 1){
				result.addMany(sides.filter(function(u){return !doneCombining.contains(u);}));
			}
			else if(sides.length == 2){
				result.addMany(combine(sides[0], sides[1]).filter(function(u){return !doneCombining.contains(u);}));
			}else{
				doneCombining.addMany(sides);
				result = pathSet();
				sides.map(function(s,i){
					sides.map(function(t,j){
						if(j > i){
							result.addMany(combine(s,t).filter(function(u){return !doneCombining.contains(u);}));
						}
					})
				});
			}
			if(result.paths.length > 0){
				doneCombining.addMany(result.paths);
				var a=0;
				return combineMany(result.paths, doneCombining);
			}else{
				return doneCombining.paths;
			}
		};
		

		var contour = (function(){
			var group = function(outerSide, holes){

			};
			var goesAround = function(s1,s2){
				return !s2.find(function(s){
					var isOutsideOfS1 = !s1.containsPoint(s.from) && !s1.goesAround(s.from);
					return isOutsideOfS1;
				});
			};
			var isFirstOutsideOf = function(s1,s2,allSides){
				return goesAround(s1,s2) && !allSides.some(function(s){
					var isBetween = s!=s1 && s!=s2 && goesAround(s1, s) && goesAround(s, s2);
					return isBetween; 
				});
			};
			var isOuterSide = function(s, allSides){
				return s.area() > 0 && !allSides.some(function(ss){
					var rightAround = ss!=s && isFirstOutsideOf(ss, s, allSides) && ss.area() > 0;
					
					return rightAround;
				});
			};
			var isHole = function(s, allSides){
				return s.area() < 0 && allSides.some(function(ss){
					return ss!=s && isFirstOutsideOf(ss, s, allSides) && ss.area() > 0;
				});
			};
			return function(sides){
				sides = sides.filter(function(s){return isOuterSide(s, sides) || isHole(s, sides);});
				return {
					rot:function(alpha){
						return contour(sides.map(function(s){return s.rot(alpha);}))
					},
					translate:function(x,y){
						return contour(sides.map(function(s){return s.translate(x,y);}));
					},
					scale:function(r){
						return contour(sides.map(function(s){return s.scale(r);}));
					},
					combine:function(cntr){
						return contour(combineMany(sides.concat(cntr.sides)));
					},
					combineNegative:function(cntr){
						return contour(combineMany(sides.concat(cntr.sides.map(function(s){return s.reverse();}))));
					},
					goAlongPaths:function(beginPath, pathStep, endPath){
						var index;
						sides.map(function(s){
							index = 0;
							s.follow(function(ss){
								if(index == 0){
									beginPath.apply(null,[ss]);
								}
								pathStep.apply(null,[ss]);
								index++;
							});
							endPath.apply(null);
						});
					},
					sides:sides
				};
			};
		})();

		var rectangleSide = function(x,y,width,height){
			return sideBuilder(point(x,y)).to(point(x, y+height)).to(point(x+width,y+height)).to(point(x+width,y)).to(point(x,y)).close();
		};

		var rectangle = function(x,y,width,height){
			var sides = [rectangleSide(x,y,width,height)];
			return contour(sides);
		};
		console.log(combineMany([
			rectangleSide(0,0,10,10),
			rectangleSide(7,7,10,10),
			rectangleSide(14,14,10,10)
			]));

		return {
			rectangle:rectangle,
			point:point,
			contour:contour
		};
	})();
})()