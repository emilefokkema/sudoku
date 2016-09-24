;(function(){
	window.contourMaker = (function(){
		var doTests = false;
		var rectangle;
		var test = (function(){
			return function(name,t){
				if(!doTests){return;}
				try{
					t.apply({
						assert:function(bool, message){
							if(!bool && console.error){
								console.error("["+name+"] "+message);
							}
						},
						expect:function(actual){
							return {
								toBe:function(expected, message){
									if(actual != expected && console.error){
										console.error("["+name+"] "+(message||"")+" (expected "+expected+" but saw "+actual+")");
									}
								}
							};
						}
					},[]);
				}
				catch(e){
					console.error("["+name+"] "+e.message);
				}
				
			};
		})();
		
		Array.prototype.groupBy = (function(){
			var group = function(key,firstMember){
				var members = [firstMember];
				return {
					key:key,
					members:members,
					add:function(o){members.push(o);}
				};
			};
			var findMemberForGroup = function(current, candidates, eq){
				var result;
				for(var i=0;i<candidates.length;i++){
					if(
						current.indexOf(candidates[i]) == -1 && 
						(
							current.some(function(c){return eq(c,candidates[i]);}) ||
							current.length == 0
						)
					){
						return candidates[i];
					}
				}
			};
			return function(keyF, keyEquals){
				if(arguments.length == 1 && arguments[0].length == 2){
					return (function(self,eq){
						var match,groups = [[]];
						while(self.length > 0){
							match = findMemberForGroup(groups[groups.length - 1], self, eq);
							if(match){
								groups[groups.length - 1].push(match);
							}else{
								match = self[0];
								groups.push([match]);
							}
							self.splice(self.indexOf(match),1);
						}
						return groups;
					})(this.map(function(x){return x;}), arguments[0]);
				}
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
		
		Array.prototype.mapMany = function(getArray){
			var res = [];
			this.map(function(el,i){
				res = res.concat(getArray.apply(null,[el,i]));
			});
			return res;
		};
		var floatPattern = "-?\\d+(?:\\.\\d+)?(?:e-?\\d+)?";
		var sign = {
			NEGATIVE:-1,
			POSITIVE:1
		};
		var point = function(x,y){
			return {
				minus:function(p){return point(x-p.x,y-p.y);},
				plus:function(p){return point(x+p.x,y+p.y);},
				cross:function(p){return x*p.y - y*p.x;},
				scale:function(r){
					return point(r*x, r*y);
				},
				scaleInv:function(r){
					return point(x/r, y/r);
				},
				matrix:function(a,b,c,d){return point(a*x+b*y,c*x+d*y);},
				mod:function(){return Math.sqrt(Math.pow(x,2)+Math.pow(y,2));},
				dot:function(p){return x*p.x+y*p.y;},
				rot:function(){
					if(arguments.length == 1){
						var alpha = arguments[0];
						return point(x*Math.cos(alpha)-y*Math.sin(alpha), y*Math.cos(alpha)+x*Math.sin(alpha));
					}else{
						var tr = point(arguments[1], arguments[2]);
						return this.minus(tr).rot(arguments[0]).plus(tr);
					}
				},
				projectOn:function(p){
					return p.scale(this.dot(p)/p.mod());
				},
				unit:function(){
					return this.scaleInv(this.mod());
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
		point.fromString = function(s){
			var rgx = new RegExp("\\(("+floatPattern+"),("+floatPattern+")\\)");
			var match = s.match(rgx);
			return point(parseFloat(match[1]),parseFloat(match[2]));
		};
		window.point = point;
		var isTheOne = function(p){return p.x>7 && p.x<7.05;};
		var segmentsAreFarApart = function(p1,p2,q1,q2){
			return Math.max(p1.x,p2.x) < Math.min(q1.x,q2.x) || Math.max(q1.x,q2.x) < Math.min(p1.x,p2.x)
				|| Math.max(p1.y,p2.y) < Math.min(q1.y,q2.y) || Math.max(q1.y,q2.y) < Math.min(p1.y,p2.y);
		};
		var intersectSegments = function(p1,p2,q1,q2){
			if(segmentsAreFarApart(p1,p2,q1,q2)){
				return []
			}
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
				var st = q1.minus(p1).matrix(-x2.y, x2.x, -x1.y, x1.x).scaleInv(cross);
				if(st.x>1||st.y>1||st.x<0||st.y<0){
					return [];
				}else{
					return [p1.plus(p2.minus(p1).scale(st.x))];
				}
			}
			
		};

		var intersectLines = function(p1,p2,q1,q2){
			var x1 = p2.minus(p1);
			var x2 = q2.minus(q1);
			var cross = x2.cross(x1);
			if(cross == 0){
				return null;
			}
			var st = q1.minus(p1).matrix(-x2.y, x2.x, -x1.y, x1.x).scaleInv(cross);
			return p1.plus(p2.minus(p1).scale(st.x));
		};

		var box = function(minx, maxx, miny, maxy){
			return {
				minx:minx,
				maxx:maxx,
				miny:miny,
				maxy:maxy,
				plus:function(b){
					return box(Math.min(minx, b.minx), Math.max(maxx, b.maxx), Math.min(miny, b.miny), Math.max(maxy, b.maxy));
				},
				toRectangle: function(){
					return rectangle(minx, miny, maxx - minx, maxy - miny);
				},
				expand: function(specs){
					return box(minx - (specs.left || 0), maxx + (specs.right || 0), miny - (specs.top || 0), maxy + (specs.bottom || 0));
				}
			};
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
			var filter = function(cond){
				var toKeep = [];
				follow(function(s){
					if(cond.apply(null,[s])){
						toKeep.push(s);
					}
				});
				return toKeep;
			};
			var change = function(newPoint){
				var builder = sideBuilder(newPoint(ret.from));
				follow(function(s){
					builder = builder.to(newPoint(s.to));
				});
				return builder.close();
			};
			var hasZeroLength = function(s){return s.to.equals(s.from);};
			var isNotStraightContinuation = function(s){return s.to.minus(s.from).cross(s.prev().to.minus(s.prev().from)) != 0;};
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
					if(p.equals(this.from)){

						return next;
					}else if(p.equals(this.to)){
						return next.next();
					}else{
						var newSide = side(this.from, p).next(side(p,this.to)).next(next);
						prev.next(newSide.prev().prev());
						return newSide;
					}
					
				},
				filter:filter,
				eliminate:function(){
					prev.next(next);
				},
				expand:(function(){
					var makeLine = function(s, d){
						var out = s.to.minus(s.from).rot(Math.PI/2).unit().scale(d);
						return {
							p1: s.from.plus(out),
							p2: s.to.plus(out),
							equals:function(l){
								return l.p1.equals(this.p1) && l.p2.equals(this.p2);
							}
						};
					};
					return function(d){
						var line,nextLine,firstLine,builder,points=[],self=this;
						follow(function(s){
							if(points.length == 0){
								firstLine = makeLine(s,d);
								line = firstLine;
							}else{
								line = nextLine;
							}
							nextLine = makeLine(s.next(), d);
							points.push(intersectLines(line.p1, line.p2, nextLine.p1, nextLine.p2));
						});
						builder = sideBuilder(points[0]);
						for(var i=1;i<points.length;i++){
							builder = builder.to(points[i]);
						}
						return combine.withItself(builder.to(points[0]).close()).filter(function(s){return s.sign() == self.sign();})[0];
					};
				})(),
				extend:function(){
					var newNext = next.find(isNotStraightContinuation);
					if(newNext != next){
						newNext = prev.next(side(this.from, newNext.from)).next(newNext);
					}
					return newNext;
				},
				clean:function(){
					var toKeep = this.find(function(s){return !hasZeroLength(s);});
					filter(hasZeroLength).map(function(s){s.eliminate();});
					toKeep = toKeep.filter(isNotStraightContinuation).map(function(s){return s.extend();})[0];
					return toKeep;
				},
				addPoints:function(arr){
					arr.sort(function(a,b){return a.minus(ret.from).mod() - b.minus(ret.from).mod();});
					var currentPart = this;
					arr.map(function(p){
						currentPart = currentPart.addPoint(p).prev();
					});
				},
				intersectWithVertical:function(x){
					var box = this.box();
					var segment = side(point(x,box.miny - 1),point(x, box.maxy + 1));
					var intersections = [];
					follow(function(s){
						intersections = intersections.concat(s.intersectWith(segment).map(function(p){return {side:s,point:p,vertical:segment};}));
					});
					var result = intersections.length > 0 ? intersections
						.groupBy(function(a,b){return a.point.equals(b.point);})
						.map(function(g){return g[0];}) : intersections;
					return result;

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
				rot:function(){
					var args = arguments;
					return change(function(p){return p.rot.apply(p, args);});
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
				angleRoundingEnd:function(r){
					var x = this.to.minus(this.from);
					var angle = x.angleLeftFrom(prev.from.minus(this.from));
					if(angle > Math.PI){
						angle = 2*Math.PI - angle;
					}
					var d = r/Math.tan(angle/2);
					return this.from.plus(x.scale(d/x.mod()));
				},
				angleRoundingBegin:function(r){
					var x = this.from.minus(this.to);
					var angle = x.angleLeftFrom(next.to.minus(this.to));
					if(angle > Math.PI){
						angle = 2*Math.PI - angle;
					}
					var d = r/Math.tan(angle/2);
					return this.to.plus(x.scale(d/x.mod()));
				},
				box:function(){
					var minx=null,maxx=null,miny=null,maxy=null;
					var compare = function(cand, cond, curr){
						return curr == null ? cand : (cond(cand,curr) ? cand : curr);
					};
					follow(function(s){
						minx = compare(s.from.x, function(cand,curr){return cand <= curr;}, minx);
						maxx = compare(s.from.x, function(cand,curr){return cand >= curr;}, maxx);
						miny = compare(s.from.y, function(cand,curr){return cand <= curr;}, miny);
						maxy = compare(s.from.y, function(cand,curr){return cand >= curr;}, maxy);
					});
					return box(minx, maxx, miny, maxy);
				},
				find:function(condition){
					var res = null;
					follow(function(s, stop){
						if(condition(s)){
							res = s;
							stop();
						}
					});
					return res;
				},
				sideFrom:function(p){
					return this.find(function(s){return s.from.equals(p);});
				},
				area:function(){
					var a = 0;
					follow(function(s){
						a += (s.to.x - s.from.x)*(s.from.y + s.to.y)/2
					});
					return a;
				},
				sign:function(){
					return this.area() >= 0 ? sign.POSITIVE : sign.NEGATIVE;
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
					var s=this.from.toString();
					follow(function(ss){
						s += "-->"+ss.to.toString();
					});
					return s;
				},
				sideContainsPoint:function(p){
					return this.from.equals(p) || this.to.equals(p) || (this.from.minus(p).cross(this.to.minus(p)) == 0 && p.isBetween(this.from, this.to));
				},
				reverse:function(){
					var last,snext,res,from = this.from,to = this.to;
					follow(function(s){
						if(!res){
							last = side(s.to, s.from);
							res = last;
						}else{
							res = res.prev(side(s.to, s.from));
						}
					});
					return res.prev(last);
				},
				length:function(){
					var n=0;
					follow(function(){n++;})
					return n;
				},
				isSelfIntersecting:function(){
					var res = false;
					follow(function(s, stop1){
						follow(function(t, stop2){
							if(s!=t && s.intersectWith(t).length > 0 && s.next() != t && t.next() != s){
								res = true;
								stop2();
								stop1();
							}
						});
					});
					return res;
				},
				intersects:function(other){
					var res = false;
					follow(function(s,stop1){
						other.follow(function(t,stop2){
							if(s.intersectWith(t).length > 0){
								res = true;
								stop2();
								stop1();
							}
						});
					});
					return res;
				},
				lastPointBefore:function(p){
					return this.reverse().firstPointAfter(p);
				},
				firstPointAfter:function(p){
					var found = this.find(function(s){
						return !s.to.equals(p);
					});
					return found.to;
				}

			};
			return ret;
		};
		side.fromString = function(s){
			var match = s.match(/\([^)]+\)/g);
			var builder;
			for(var i=0;i<match.length;i++){
				if(i==0){
					builder = sideBuilder(point.fromString(match[i]));
				}else{
					builder = builder.to(point.fromString(match[i]));
				}
			}
			return builder.close();
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
					return side_.close().next();
				}
			};
		};
		
		var pathSet = function(){
			var paths = [];
			var contains = function(s){
				s = s.clone().clean();
				return paths.some(function(t){
					return t.isSameAs(s) || t.overlapsWith(s);
				});
			};
			var add = function(s){
				s = s.clean();
				if(!s){return;}
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
			
			var f = function(p, s, t){
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
					two: t
					
				};
			};
			
			return f;
		})();
		
		var combine = (function(){
			var sideFrom = function(p, toSearch){
				return toSearch.find(function(s){return s.from.equals(p);});
			};

			var sidesFrom = function(p, toSearch){
				return toSearch.filter(function(s){return s.from.equals(p);});
			};

			
			

			var getSwitchableSelfIntersections = function(s){
				var newIntersections, intersections = [];
				s.follow(function(s){
					s.follow(function(t){
						if(s!=t && s.next() != t && t.next() != s){
							newIntersections = s.intersectWith(t).map(function(p){
								return intersection(p, s, t);
							}).filter(function(i){
								return !intersections.some(function(j){
									return i.point.equals(j.point);
								});
							});
							intersections = intersections.concat(newIntersections);
						}
					});
				});
				return intersections.filter(function(i){return i.toBeSwitched;});
			};

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
				return intersections.filter(function(i){return i.toBeSwitched;});
			};

			var switchPairs = function(pairsToSwitch){
				pairsToSwitch.map(function(p){
					p.fromOnePrev.next(p.fromTwo);
					p.fromTwoPrev.next(p.fromOne);
				});
				var resultingPaths = pathSet();
				pairsToSwitch.map(function(p){
					resultingPaths.add(p.fromOne);
					resultingPaths.add(p.fromTwo);
				});
				
				return resultingPaths.paths;
			};

			var addPointsForIntersections = (function(){
				var addPoints = function(g){
					g.key.addPoints(g.members.map(function(m){return m.point;}));
				};
				return function(intersections){
					intersections.groupBy(function(i){return i.one;}).map(addPoints);
					intersections.groupBy(function(i){return i.two;}).map(addPoints);
				};
			})();


			var r = function(s1,s2){
				var s1Original = s1;
				var s2Original = s2;
				s1 = s1.clone();
				s2 = s2.clone();
				if(s1.area() == 0 || s2.area() == 0){
					return [s1Original,s2Original];
				}
				var intersections = getSwitchableIntersections(s1, s2);
				if(intersections.length==0){
					return [s1Original,s2Original];
				}
				addPointsForIntersections(intersections);
				
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
				return switchPairs(pairsToSwitch);
			};
			r.withItself = function(s){
				var sOriginal = s;
				if(!s.isSelfIntersecting()){
					return [sOriginal];
				}
				s = s.clone();
				var intersections = getSwitchableSelfIntersections(s);
				if(intersections.length == 0){
					return [sOriginal];
				}
				addPointsForIntersections(intersections);

				var pairsToSwitch = intersections.map(function(i){
					var froms = sidesFrom(i.point, s);
					var fromOne = froms[0];
					var fromTwo = froms[1];
					return {
						fromOne:fromOne,
						fromTwo:fromTwo,
						fromOnePrev:fromOne.prev(),
						fromTwoPrev:fromTwo.prev()
					};
				});

				return switchPairs(pairsToSwitch);
			};
			return r;
		})();

		window.combine=combine;


		var combineManyThings = (function(){
			var thingWithCombinationHistory = function(thing, history){

				return {
					thing:thing,
					history:history
				};
			};
			var history = function(indices){
				var isDisjointWith = function(other){
					return indices.some(function(i){return other.indices.indexOf(i) == -1;}) && other.indices.some(function(i){return indices.indexOf(i) == -1});
				};
				var combine = function(other){
					return history(indices.concat(other.indices.filter(function(i){return indices.indexOf(i) == -1;})));
				};
				return {
					indices:indices,
					isDisjointWith:isDisjointWith,
					combine:combine
				};
			};
			var combination = function(thingWithHistory1, thingWithHistory2, combineTwoThings){
				var newThings = combineTwoThings(thingWithHistory1.thing, thingWithHistory2.thing);
				var newHistory = thingWithHistory1.history.combine(thingWithHistory2.history);
				return newThings.map(function(t){
					return thingWithCombinationHistory(t, newHistory);
				});
			};
			var findCombinableThingsWithDisjointHistories = function(allThings, areCombinable){
				for(var i=0;i<allThings.length-1;i++){
					for(var j=i+1;j<allThings.length;j++){
						if(allThings[i].history.isDisjointWith(allThings[j].history) && areCombinable(allThings[i].thing, allThings[j].thing)){
							return [allThings[i], allThings[j]]
						}
					}
				}
				return null;
			};

			var f = function(things, combineTwoThings, areCombinable){
				var newPair, allThings = things.map(function(t,i){return thingWithCombinationHistory(t, history([i]));});
				while(newPair = findCombinableThingsWithDisjointHistories(allThings, areCombinable)){
					allThings.splice(allThings.indexOf(newPair[0]), 1);
 					allThings.splice(allThings.indexOf(newPair[1]), 1);
					combination(newPair[0],newPair[1],combineTwoThings).map(function(t){allThings.push(t);});

				}
				var res = allThings.map(function(t){return t.thing;});
				return res;
			};
			f.async = function(things, combineTwoThings, areCombinable, update, done, timeOutWhile){
				var newPair, allThings = things.map(function(t,i){return thingWithCombinationHistory(t, history([i]));});
				timeOutWhile(
					function(){return newPair = findCombinableThingsWithDisjointHistories(allThings, areCombinable);}, 
					function(update){
						allThings.splice(allThings.indexOf(newPair[0]), 1);
 						allThings.splice(allThings.indexOf(newPair[1]), 1);
						combination(newPair[0],newPair[1],combineTwoThings).map(function(t){allThings.push(t);});
						update(0.5);
					}, 20, function(){
						update(1);
						done(allThings.map(function(t){return t.thing;}));
					}, update);
			};
			return f;
		})();
		
		var combineMany = (function(){
			return function(sides){
				return combineManyThings(sides, combine, function(s1,s2){return s1.intersects(s2);});
			};
		})();

		var combineManyContours = (function(){
			return function(contours){
				return combineManyThings(contours, function(c1,c2){return [c1.combine(c2)];}, function(c1,c2){return c1.intersects(c2);});
			};
		})();

		var combineManyContoursAsync = (function(){
			return function(contours, update, done, timeOutWhile){
				combineManyThings.async(
					contours,
					function(c1,c2){
						var newOne = c1.combine(c2);
						if(newOne.sides.length == 0){
							console.warn("combination of contour1 with sides ["+c1.sides.map(function(s){return s.toString();}).join("|")+"]"+
								" and contour2 with sides ["+c2.sides.map(function(s){return s.toString();}).join("|")+"] resulted in a contour with no sides");
						}
						return [newOne];
					},
					function(c1,c2){return c1.intersects(c2);},
					update,
					done,
					timeOutWhile);
			};
		})();

		var contour = (function(){
			var holelessPathSet = function(sides, cutoffPoints){
				return {
					sides:sides,
					cutoffPoints:cutoffPoints
				};
			};
			var getMiddles = function(intervals){
				return intervals
					.groupBy(function(a,b){return b[0]<=a[1]&&b[1]>=a[0];})
					.map(function(parts){
						var boundaries = parts.reduce(function(a,b){return a.concat(b);}).sort(function(a,b){return a - b;});
						return (boundaries[0] + boundaries[boundaries.length-1]) / 2;
					});

			};
			var group = function(outerSide, holes){
				var getHolelessPaths = function(){
					if(holes.length == 0){
						return holelessPathSet([outerSide],[]);
					}else{
						var intersectionSet,x,downFrom,downTo,upFrom,upTo,i,box,intersections,verticals,
							affectedSides=[],
							outerSideCopy = outerSide.clone(),
							holesCopy = holes.map(function(h){return h.clone();});

						verticals = getMiddles(holesCopy.map(function(hole){
							box = hole.box();
							return [box.minx, box.maxx];
						}));
						intersectionSet = verticals.map(function(x){
							return outerSideCopy.intersectWithVertical(x)
								.concat(holesCopy.mapMany(function(hole1){
									return hole1.intersectWithVertical(x);
								}))
								.sort(function(a,b){return a.point.y - b.point.y;})
								.filter(function(i){return intersection(i.point, i.side, i.vertical).toBeSwitched;});
						});

						if(intersectionSet.some(function(s){return s.length % 2 != 0;})){
							throw new Error("intersection between contour group and vertical did not result in an even number of intersections");
						}

						intersectionSet.mapMany(function(intersections){return intersections;})
							.groupBy(function(i){return i.side;})
							.map(function(g){
								g.key.addPoints(g.members.map(function(m){return m.point;}));
							});

						intersectionSet.mapMany(function(intersections){return intersections;})
							.map(function(i){
								i.side = i.side.sideFrom(i.point);
							});

						intersectionSet.map(function(intersections){
							for(i=0;i<intersections.length;i+=2){
								downTo = intersections[i].side;
								downFrom = downTo.prev();
								upTo = intersections[i+1].side;
								upFrom = upTo.prev();
								affectedSides.push(downFrom.next(side(downFrom.to, upTo.from)).next(upTo));
								affectedSides.push(upFrom.next(side(upFrom.to, downTo.from)).next(downTo));		
							}
						});

						return holelessPathSet(
							pathSet().addMany(affectedSides).paths,
							intersectionSet.mapMany(function(intersections){return intersections.map(function(i){return i.point;});})
							);

					}
				};
				var area = function(){
					return outerSide.area() + holes.map(function(h){return h.area();}).reduce(function(a,b){return a+b;},0);
				};
				return {
					outerSide:outerSide,
					holes:holes,
					getHolelessPaths:getHolelessPaths,
					area:area,
					box:function(){
						return outerSide.box();
					}
				};
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
			var findHolesForOuterSide = function(outer, allSides){
				return allSides.filter(function(s){
					return s.area() < 0 && isFirstOutsideOf(outer, s, allSides);
				});
			};
			var isHole = function(s, allSides){
				return s.area() < 0 && allSides.some(function(ss){
					return ss!=s && isFirstOutsideOf(ss, s, allSides) && ss.area() > 0;
				});
			};
			var goAlongPath = function(beginPath, pathStep, endPath){
				return function(s, context){
					var soFar,index = 0;
					s.follow(function(ss){
						if(index == 0){
							soFar = beginPath.apply(null,[ss, context]);
						}
						soFar = pathStep.apply(null,[ss,soFar, context]);
						index++;
					});
					return endPath.apply(null,[soFar, context]);
				};
			};
			var canvasFunctions = {
				angleRoundingBeginPath: function(ctx,r){
					return function(firstSide, isCutoffPoint){
						ctx.beginPath();
						var p = isCutoffPoint(firstSide.from) ? firstSide.from : firstSide.angleRoundingEnd(r);
						ctx.moveTo(p.x,p.y);
					};
				},
				beginPath : function(ctx){
					return function(firstSide){
						ctx.beginPath();
						ctx.moveTo(firstSide.from.x, firstSide.from.y);
					};
				},
				pathStep: function(ctx){
					return function(nextSide){
						ctx.lineTo(nextSide.to.x, nextSide.to.y);
					};
				},
				angleRoundingPathStep:function(ctx,r){
					return function(nextSide, soFar, isCutoffPoint){
						if(isCutoffPoint(nextSide.to)){
							ctx.lineTo(nextSide.to.x, nextSide.to.y);
						}else{
							var nextnext = nextSide.next();
							ctx.arcTo(nextSide.to.x, nextSide.to.y, nextnext.to.x, nextnext.to.y,r);
						}
					};
				},
				endPath : function(ctx, pathCompleteCallback){
					return function(){
						ctx.closePath();
						pathCompleteCallback && pathCompleteCallback.call(null,[]);
					};
				}
			};
			var svgFunctions = {
				angleRoundingBeginPath:function(r){
					return function(firstSide, isCutoffPoint){
						if(typeof isCutoffPoint !=="function"){
							console.log("whoa");
						}
						var p = isCutoffPoint(firstSide.from) ? firstSide.from : firstSide.angleRoundingEnd(r);
						return "M"+p.x+" "+p.y;
					};
				},
				beginPath: function(firstSide){
					return "M"+firstSide.from.x+" "+firstSide.from.y;
				},
				pathStep: function(nextSide, soFar){
					return soFar+" L "+nextSide.to.x+" "+nextSide.to.y;
				},
				angleRoundingPathStep:function(r){
					return function(nextSide, soFar, isCutoffPoint){
						if(isCutoffPoint(nextSide.to)){
							return soFar + " L "+nextSide.to.x+" "+nextSide.to.y;
						}else{
							var p1 = nextSide.angleRoundingBegin(r);
							var p2 = nextSide.next().angleRoundingEnd(r);
							return soFar+" L "+p1.x+" "+p1.y+" Q "+nextSide.to.x+" "+nextSide.to.y+" "+p2.x+" "+p2.y;
						}
					};
				},
				endPath: function(soFar){
					return soFar+" Z";
				}
			};
			var c = function(sides, doLog){
				sides = sides.filter(function(s){return isOuterSide(s, sides) || isHole(s, sides);});
				var groups = sides
					.filter(function(s){return isOuterSide(s,sides);})
					.map(function(outer){return group(outer, findHolesForOuterSide(outer, sides));});
				return {
					rot:function(){
						var args = arguments;
						return contour(sides.map(function(s){return s.rot.apply(s, args);}))
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
					intersects:function(cntr){
						return sides.some(function(s){return cntr.sides.some(function(ss){return s.intersects(ss);});});
					},
					combineNegative:function(cntr){
						return contour(combineMany(sides.concat(cntr.sides.map(function(s){return s.reverse();}))));
					},
					goAlongPaths:function(beginPath, pathStep, endPath){
						var mapResult = [];
						var mapper = goAlongPath(beginPath, pathStep, endPath);
						for(var i=0;i<sides.length;i++){
							mapResult.push(mapper.apply(null,[sides[i], function(){return false;}]));
						}
						return mapResult;
					},
					goAlongHolelessPaths:function(beginPath, pathStep, endPath){
						var holelessPaths = groups.map(function(g){return g.getHolelessPaths();});
						var mapper = goAlongPath(beginPath, pathStep, endPath);
						return holelessPaths.mapMany(function(hps){
							var mapResult = [];
							var isCutoffPoint = function(p){return hps.cutoffPoints.some(function(pp){return pp.equals(p);});};
							for(var i=0; i<hps.sides.length;i++){
								mapResult.push(mapper.apply(null,[hps.sides[i], isCutoffPoint]));
							}
							return mapResult;
						});
					},
					getHolelessPaths:function(){
						return groups.mapMany(function(g){return g.getHolelessPaths().sides;});
					},
					area:function(){
						return groups.map(function(g){return g.area();}).reduce(function(a,b){return a+b;});
					},
					boxes:function(){
						return groups.map(function(g){return g.box();});
					},
					box:function(){
						return this.boxes().reduce(function(a,b){return a.plus(b);});
					},
					expand:function(d){
						return contour(combineMany(sides.map(function(s){return s.expand(d);})));
					},
					makeCanvasPaths:function(canvasRenderingContext, pathCompleteCallback, roundingRadius){
						if(roundingRadius){
							return this.goAlongPaths(
								canvasFunctions.angleRoundingBeginPath(canvasRenderingContext,roundingRadius),
								canvasFunctions.angleRoundingPathStep(canvasRenderingContext, roundingRadius),
								canvasFunctions.endPath(canvasRenderingContext, pathCompleteCallback)
								);
						}else{
							return this.goAlongPaths(
								canvasFunctions.beginPath(canvasRenderingContext),
								canvasFunctions.pathStep(canvasRenderingContext),
								canvasFunctions.endPath(canvasRenderingContext, pathCompleteCallback)
								);
						}
						
					},
					makeSvgPaths:function(roundingRadius){
						if(roundingRadius){
							return this.goAlongPaths(
								svgFunctions.angleRoundingBeginPath(roundingRadius),
								svgFunctions.angleRoundingPathStep(roundingRadius),
								svgFunctions.endPath
								);
						}else{
							return this.goAlongPaths(
								svgFunctions.beginPath,
								svgFunctions.pathStep,
								svgFunctions.endPath
								);
						}
						
					},
					makeHolelessCanvasPaths:function(canvasRenderingContext, pathCompleteCallback, roundingRadius){
						if(roundingRadius){
							return this.goAlongHolelessPaths(
								canvasFunctions.angleRoundingBeginPath(canvasRenderingContext, roundingRadius),
								canvasFunctions.angleRoundingPathStep(canvasRenderingContext, roundingRadius),
								canvasFunctions.endPath(canvasRenderingContext, pathCompleteCallback)
								);
						}else{
							return this.goAlongHolelessPaths(
								canvasFunctions.beginPath(canvasRenderingContext),
								canvasFunctions.pathStep(canvasRenderingContext),
								canvasFunctions.endPath(canvasRenderingContext, pathCompleteCallback)
								);
						}
						
					},
					makeHolelessSvgPaths: function(roundingRadius){
						if(roundingRadius){
							return this.goAlongHolelessPaths(
								svgFunctions.angleRoundingBeginPath(roundingRadius),
								svgFunctions.angleRoundingPathStep(roundingRadius),
								svgFunctions.endPath
								);
						}else{
							return this.goAlongHolelessPaths(
								svgFunctions.beginPath,
								svgFunctions.pathStep,
								svgFunctions.endPath
								);
						}
						
					},
					sides:sides
				};
			};
			c.combineMany = function(contours){
				var contours = combineManyContours(contours);
				return contours[0];
			};
			c.combineManyAsync = function(contours, update, done, timeOutWhile){
				combineManyContoursAsync(contours, update, function(_contours){
					done(_contours[0]);
				}, timeOutWhile);
			};
			return c;
		})();

		var rectangleSide = function(x,y,width,height){
			return sideBuilder(point(x,y)).to(point(x, y+height)).to(point(x+width,y+height)).to(point(x+width,y)).to(point(x,y)).close();
		};

		rectangle = function(x,y,width,height){
			var sides = [rectangleSide(x,y,width,height)];
			return contour(sides);
		};

		test("intersectionTest1", function(){
			var p = intersectSegments(point(0,10),point(10,10),point(7,7),point(7,17));
			this.expect(p[0].x).toBe(7);
			this.expect(p[0].y).toBe(10);
		});
		test("clean",function(){
			var a = rectangleSide(0,0,10,10);
			a.addPoint(point(5,0)).addPoint(point(0,5)).addPoint(point(0,10));
			this.expect(a.area()).toBe(100);
			a = a.clean();
			this.expect(a.area()).toBe(100,"area changed after adding points and cleaning");
		});
		test("reverseTest1",function(){
			var a =side(point(0,0), point(1,0)).reverse();
		});
		test("firstAfterLastBefore",function(){
			var s = rectangleSide(0,0,10,10).find(function(s){return s.to.equals(point(0,0));});

			this.assert(s.firstPointAfter(point(0,0)).equals(point(0,10)));
			this.assert(s.firstPointAfter(point(5,0)).equals(point(0,0)));
			this.assert(s.lastPointBefore(point(0,0)).equals(point(10,0)));
			this.assert(s.lastPointBefore(point(5,0)).equals(point(10,0)));
		});
		test("intersectWithSelfSomethingChangesTest", function(){
			var s = sideBuilder(point(0,0)).to(point(0,10)).to(point(10,10)).to(point(20,10)).to(point(20,20)).to(point(10,20)).to(point(10,0)).to(point(0,0)).close();
			var res = combine.withItself(s);

			this.expect(res.length).toBe(2);
		});
		test("intersectWithSelfNothingChangesTest",function(){
			var s = rectangleSide(0,0,10,10);
			var res = combine.withItself(s);

			this.expect(res.length).toBe(1);
		});
		test("expandPositiveTest",function(){
			var s = rectangleSide(0,0,10,10);
			var sExp = s.expand(2);
			this.expect(sExp.area()).toBe(14*14);
		});
		test("expandNegativeTest",function(){
			var s = rectangleSide(0,0,10,10);
			var sExp = s.expand(-2);
			this.expect(sExp.area()).toBe(6*6);
		});
		test("expandCombinationTest",function(){
			var c = rectangle(0,0,10,10).combineNegative(rectangle(1,1,8,8));
			var cExp = c.expand(1);

			this.expect(cExp.area()).toBe(12*12 - 6*6);
		});
		test("something",function(){
			//try to reproduce this:
			//combination of contour1 with sides [(17.25,12)-->(0,12)-->(0,12.25)-->(17.25,12.25)-->(17.25,12)] and contour2 with sides [(0.25,0)-->(0,0)-->(0,12.25)-->(0.25,12.25)-->(0.25,0)] resulted in a contour with no sides
			var contour1 = contour([side.fromString("(17.25,12)-->(0,12)-->(0,12.25)-->(17.25,12.25)-->(17.25,12)")]);
			var contour2 = contour([side.fromString("(0.25,0)-->(0,0)-->(0,12.25)-->(0.25,12.25)-->(0.25,0)")]);
			this.expect(contour1.combine(contour2).sides.length).toBe(1);
		});
		test("negative combine 1",function(){
			var a = rectangleSide(0,0,10,10);
			var b = rectangleSide(0,0,10,5).reverse();
			var c = contour(combine(a,b)).sides;
			this.expect(c.length).toBe(1, "expected 1 path");
			this.expect(c[0].length()).toBe(4, "expected 4 sides");
			this.expect(c[0].area()).toBe(50, "expected area 50");
		});
		test("negative combine 2",function(){
			var a = rectangleSide(0,0,10,10);
			var b = rectangleSide(0,0,8,5).reverse();
			var c = contour(combine(a,b)).sides;
			this.expect(c.length).toBe(1, "expected 1 path");
			this.expect(c[0].length()).toBe(6, "expected 6 sides");
			this.expect(c[0].area()).toBe(60, "expected area 60");
		});
		test("combineMany",function(){
			var c = combineMany([
				rectangleSide(0,0,10,10),
				rectangleSide(7,7,10,10),
				rectangleSide(14,14,10,10),
				rectangleSide(21,21,10,10)
			]);
			var areas = c.map(function(s){return s.area();});
			this.expect(c.length).toBe(4, "expected 4 resulting sides");
			this.assert(areas.indexOf(373) != -1, "expected an area of 373");
		});
		test("holelessPaths",function(){
			var c = rectangle(0,0,10,10).combineNegative(rectangle(2,2,6,6));
			var holeless = c.getHolelessPaths();

			this.expect(c.area()).toBe(64);
			this.expect(holeless.length).toBe(2);
			this.expect(holeless
					.map(function(h){return h.area();})
					.reduce(function(a,b){return a+b;})
				).toBe(64);
		});
		test("twiceSideOverlapTest",function(){
			var r1 = rectangle(0,0,10,5);
			var r2 = rectangle(0,0,5,10);
			var c = r1.combine(r2);
			this.expect(c.area()).toBe(75);
		});
		test("onceSideOverlapTest",function(){
			var r1 = rectangle(0,0,10,5);
			var r2 = rectangle(0,0,5,10);
			var c = r1.combine(r2);
			this.expect(c.area()).toBe(75);
		});
		test("holelessPaths2",function(){
			var c = rectangle(0,0,20,10).combineNegative(rectangle(2,2,6,6)).combineNegative(rectangle(12,2,6,6));
			var holeless = c.getHolelessPaths();

			this.expect(c.area()).toBe(128);
			this.expect(holeless.length).toBe(3);
			this.expect(holeless
					.map(function(h){return h.area();})
					.reduce(function(a,b){return a+b;})
				).toBe(128);
		});
		test("holelessPathsWithRotationTest1",function(){
			var c = rectangle(0,0,20,10)
				.combineNegative(rectangle(2,2,6,6))
				.combineNegative(rectangle(12,2,6,6))
				.rot(Math.PI/2);
			var holeless = c.getHolelessPaths();

			this.expect(c.area()).toBe(128, "initial area");
			this.expect(holeless.length).toBe(2);
			this.expect(holeless
					.map(function(h){return h.area();})
					.reduce(function(a,b){return a+b;})
				).toBe(128, "area of sum of holeless paths");
		});
		test("holelessPaths5",function(){
			var contour2 = rectangle(10,10,10,10).combine(rectangle(7,7,6,6));
			var contour1 = contour2.combineNegative(rectangle(8,8,4,4));

			var holeless = contour1.getHolelessPaths();
			this.expect(holeless.length).toBe(2);
		});
		test("holelessPathsWithRotationTest2",function(){
			var c = rectangle(0,0,20,20).combineNegative(rectangle(5,5,10,10)).rot(Math.PI/4);
			var holeless = c.getHolelessPaths();

			this.expect(c.area()).toBe(300, "initial area");
			this.expect(holeless
					.map(function(h){return h.area();})
					.reduce(function(a,b){return a+b;})
					).toBe(300, "combined are of holeless");
		});
		return {
			rectangle:rectangle,
			point:point,
			contour:contour
		};
	})();
})()