require.config({
	baseUrl:"scripts/"
});

requirejs(["getSolution","testSet","getPossibilities","subdivision","numberSet","findContainedSet"],function(getSolution, testSet, getPossibilities, subdivision, numberSet, findContainedSet){
	testSet = testSet(function(e){console.error(e);}, function(s){console.info(s);});

	testSet("containedSetTest", function(test){
		test("findContainedTwoSingle", function(){
			var testList = [numberSet([3,4,5]), numberSet([1,3,5]), numberSet([3,4,5])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 1);
			this.assert(indices[0] == 1);
		});

		test("findContainedTwoSingle2", function(){
			var testList = [numberSet([1,3,5,6,8]), numberSet([6,8,9]), numberSet([1,3,5,6]), numberSet([5,8,9]), numberSet([1,3,5]), numberSet([1,6,8]), numberSet([1,7,8,9])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 1);
			this.assert(indices[0] == 6);
		});

		test("findContainedTwoDouble", function(){
			var testList = [numberSet([3,4,5]), numberSet([1,2,3,5]), numberSet([1,2,3,5]), numberSet([3,4,5])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 2);
			this.assert(indices[0] == 1);
			this.assert(indices[1] == 2);
		});

		test("another case",function(){
			var testList = [numberSet([2,3,8]), numberSet([1,2,6,7]), numberSet([2,6,7,8]), numberSet([1,3]), numberSet([1,2,8]), numberSet([1,8])];
			var set = findContainedSet(testList);
			var indices = set.indices.toArray();
			var numbers = set.numbers.toArray();
			this.assert(indices.length == 2);
			this.assert(indices[0] == 1);
			this.assert(indices[1] == 2);
			this.assert(numbers[0] == 6);
			this.assert(numbers[1] == 7);
		})
		
	})

	testSet("possibilitiesTest", function(test){

		test("test1",function(){
			var testPossibilities = getPossibilities(getSolution.fromString("000200000103005007780900000001030000035804720000090600000009045900700302000006000")).clean().getRows();
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
			var testPossibilities = getPossibilities(solution).clean().getRows();
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
			var testPossibilities = getPossibilities(solution).clean().getRows();
			this.assert(testPossibilities[0][5].length == 1);
			this.assert(testPossibilities[0][8].length == 1)
		});

		test("testBug",function(){
			var testSolution = getSolution.fromString("067052930901700625253069087600271300190080576730596040026010700010907862079620010");
			var testPossibilities = getPossibilities(testSolution).clean();
			var emptySolution = getSolution();
			testPossibilities.getRows().map(function(r, ri){
				r.map(function(c, ci){
					if(c && c.length == 1){
						emptySolution.add(ri, ci, c[0]);
						if(!emptySolution.checkAll()){
							throw new Error();
						}
					}
				})
			});

		})

	});
})