require.config({
	baseUrl:"scripts/"
});

requirejs(["getSolution","testSet","getPossibilities","subdivision","numberSet","findContainedSet"],function(getSolution, testSet, getPossibilities, subdivision, numberSet, findContainedSet){
	testSet = testSet(function(e){console.error(e);}, function(s){console.info(s);});

	testSet("containedSetTest", function(test){
		test("test1", function(){
			var testList = [numberSet([3,4,5]), numberSet([1,3,5]), numberSet([3,4,5])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 1);
			this.assert(indices[0] == 1);
		});

		test("test2", function(){
			var testList = [numberSet([3,4,5]), numberSet([1,3,5]), numberSet([2,3,5]), numberSet([3,4,5])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 2);
			this.assert(indices[0] == 1);
			this.assert(indices[1] == 2);
		});
		
	})

	testSet("possibilitiesTest", function(test){

		test("test1",function(){
			var testPossibilities = getPossibilities(getSolution.fromString("000200000103005007780900000001030000035804720000090600000009045900700302000006000"));
			for(var i=0;i<9;i++){
				for(var j=0;j<9;j++){
					if(testPossibilities[i][j]){
						this.assert(testPossibilities[i][j].length == 1);
					}
				}
			}
		});

		test("test2", function(){
			var solution = getSolution.fromString("000100000900700500406000010045000300000602400000800000804009000100370000000001000");
			solution.setExtraKind(subdivision.NRC);
			var testPossibilities = getPossibilities(solution);
			for(var i=0;i<9;i++){
				for(var j=0;j<9;j++){
					if(testPossibilities[i][j]){
						this.assert(testPossibilities[i][j].length == 1);
					}
				}
			}
		});

		test("test3", function(){
			var solution = getSolution.fromString("000400060020003100000000000700080000003005800090702000100800502000000000000000000");
			solution.setExtraKind(subdivision.NRC);
			var testPossibilities = getPossibilities(solution);
			this.assert(testPossibilities[0][5].length == 1);
			this.assert(testPossibilities[0][8].length == 1)
		})

	});
})