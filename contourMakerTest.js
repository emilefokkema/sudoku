(function(){
	window.contourMakerTest = function(side, contour, combine, rectangleSide, intersectSegments, sideBuilder, rectangle, combineMany){
		window.contourMakerTest = function(){
			var test = (function(){
				return function(name,t){
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
			test("clean2",function(){
				var s = side.fromString("(8,0)-->(0,0)-->(0,10)-->(8,10)-->(10,10)-->(10,0)-->(8,0)");
				s = s.clean();
				this.expect(s.length()).toBe(4);
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
			test("svgTest",function(){
				var c = rectangle(0,0,3,3).combineNegative(rectangle(1,1,1,1)).scale(10);
				var svgPaths = c.makeSvgPaths();
				this.expect(svgPaths[0]).toBe("M0 0 L 0 30 L 30 30 L 30 0 L 0 0 Z");
				this.expect(svgPaths[1]).toBe("M10 20 L 10 10 L 20 10 L 20 20 L 10 20 Z");
				svgPaths = c.makeHolelessSvgPaths();
				this.expect(svgPaths[0]).toBe("M15 10 L 20 10 L 20 20 L 15 20 L 15 30 L 30 30 L 30 0 L 15 0 L 15 10 Z");
				this.expect(svgPaths[1]).toBe("M15 0 L 0 0 L 0 30 L 15 30 L 15 20 L 10 20 L 10 10 L 15 10 L 15 0 Z");
				svgPaths = c.makeSvgPaths(1);
				this.expect(svgPaths[0]).toBe("M0 1.0000000000000002 L 0 29 Q 0 30 1.0000000000000002 30 L 29 30 Q 30 30 30 29 L 30 1.0000000000000002 Q 30 0 29 0 L 1.0000000000000002 0 Q 0 0 0 1.0000000000000002 Z");
				this.expect(svgPaths[1]).toBe("M10 19 L 10 11 Q 10 10 11 10 L 19 10 Q 20 10 20 11 L 20 19 Q 20 20 19 20 L 11 20 Q 10 20 10 19 Z");
				svgPaths = c.makeHolelessSvgPaths(1);
				this.expect(svgPaths[0]).toBe("M15 10 L 19 10 Q 20 10 20 11 L 20 19 Q 20 20 19 20 L 15 20 L 15 30 L 29 30 Q 30 30 30 29 L 30 1.0000000000000002 Q 30 0 29 0 L 15 0 L 15 10 Z");
				this.expect(svgPaths[1]).toBe("M15 0 L 1.0000000000000002 0 Q 0 0 0 1.0000000000000002 L 0 29 Q 0 30 1.0000000000000002 30 L 15 30 L 15 20 L 11 20 Q 10 20 10 19 L 10 11 Q 10 10 11 10 L 15 10 L 15 0 Z");
			});
			test("svgTest2",function(){
				var s = side.fromString("(8,0)-->(0,0)-->(0,10)-->(8,10)-->(10,10)-->(10,0)-->(8,0)");
				var svg = s.toSvgPath();
				this.expect(svg).toBe("M8 0 L 0 0 L 0 10 L 8 10 L 10 10 L 10 0 L 8 0 Z");
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
			test("something3",function(){
				var s1 = side.fromString("(10,10)-->(10,8)-->(2,8)-->(2,2)-->(10,2)-->(10,0)-->(0,0)-->(0,10)-->(10,10)");
				var s2 = side.fromString("(8,0)-->(8,10)-->(10,10)-->(10,0)-->(8,0)");
				var c = combine(s1, s2);
				this.expect(c.length).toBe(4);
				c = c.map(function(s){return s.clean();});
				this.expect(c.some(function(s){return s.length() != 4;})).toBe(false, "expected all cleaned resulting sides to have length 4")
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
			test("positiveCombineToMakeHole",function(){
				var rect1 = rectangle(0,0,10,2);
				var rect2 = rectangle(0,0,2,10);
				var rect3 = rectangle(0,8,10,2);
				var rect4 = rectangle(8,0,2,10);
				var c = rect1;
				this.expect(c.area()).toBe(20,"the area isn't even right in step 1");
				c = c.combine(rect2);
				this.expect(c.area()).toBe(36,"area is wrong in step 2");
				c = c.combine(rect3);
				this.expect(c.area()).toBe(52,"area is wrong in step 3");
				c = c.combine(rect4);
				this.expect(c.area()).toBe(64,"area is wrong in step 4");
			});
			test("positiveCombineToMakeHole2",function(){
				var rect1 = rectangle(0,0,10,2);
				var rect2 = rectangle(0,0,2,10);
				var rect3 = rectangle(0,8,10,2);
				var rect4 = rectangle(8,0,2,5);
				var rect5 = rectangle(8,5,2,5);
				var c = rect1;
				this.expect(c.area()).toBe(20,"the area isn't even right in step 1");
				c = c.combine(rect2);
				this.expect(c.area()).toBe(36,"area is wrong in step 2");
				c = c.combine(rect3);
				this.expect(c.area()).toBe(52,"area is wrong in step 3");
				c = c.combine(rect4);
				this.expect(c.area()).toBe(58,"area is wrong in step 4");
				c = c.combine(rect5);
				this.expect(c.area()).toBe(64,"area is wrong in step 4");
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
			test("something2",function(){
				var side1 = side.fromString("(0,0)-->(0,0.25)-->(12.25,0.25)-->(12.25,0)-->(0,0)");
				var side2 = side.fromString("(12,0)-->(12,12.25)-->(12.25,12.25)-->(12.25,0)-->(12,0)");
				var c = combine(side1,side2);
				this.expect(c.length).toBe(2);
				this.expect(c[0].isSelfIntersecting()).toBe(false);
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
		};
	};
})();