var test = require('tape'),
	premerge = require('./../src/premerge.js'),
	fs = require('fs'),
	_ = require('underscore'),
	readJsonFile;


readJsonFile = function(path) {

	var result;

	try {
		result = JSON.parse(fs.readFileSync(path));
	}
	catch (e) {
		result = 'Parsing Error';
	}

	return result;

}

test('premerge works on simple flat matching objects', function(t) {
	
	var testObj1,
		testObj2,
		testArr;

	testObj1 = readJsonFile('./test/json/simple-object.json');
	testObj2 = _.clone(testObj1);

	testArr = [testObj1, testObj2];

	t.plan(1);

	premerge(testArr, function(err, res) {

		var expectedResult = readJsonFile('./test/json/simple-object-merged.json');

		if (err) {throw err};
		t.deepEqual(res, expectedResult, 'basic form is correct and all required keys are present' )
	
	});

});

test('object returned premerge differentiates properly between matches and non-matches', function(t) {

	var testObj1,
		testObj2,
		testArr;

	testObj1 = {
		one: 1,
		two: 2
	}

	testObj2 = {
		one: 1,
		two: 3
	}

	testArr = [testObj1, testObj2];

	t.plan(6);

	premerge(testArr, function(err, res) {

		if (err) throw err;

		t.equal(res.keyValuePairs.merge.one.match, true, 'match=true for matching values');
		t.equal(res.keyValuePairs.merge.one.value, 1, 'value is correct for matching values');
		t.equal(res.keyValuePairs.merge.one.source, 'MATCH', 'source="MATCH" for matching values');
		t.equal(res.keyValuePairs.merge.two.match, false, 'match=false for non-matching value');
		t.false(res.keyValuePairs.merge.two.value, 'value is falsy for non-matching values');
		t.false(res.keyValuePairs.merge.two.source, 'source is falsy for non-matching values');

	})

})


test('premerge works on an object with an array', function(t) {

	var testObj1,
	testObj2,
	testArr;

	testObj1 = readJsonFile('./test/json/object-with-array.json');
	testObj2 = _.clone(testObj1);

	testArr = [testObj1, testObj2];

	t.plan(1);

	premerge(testArr, function(err, res) {

		var expectedResult = readJsonFile('./test/json/object-with-array-merged.json');

		if (err) {throw err};

		t.deepEqual(res, expectedResult, 'basic form is correct and all matching array values are merged' )
	
	});
});

test('premerge works with arrays that do not match', function(t) {

	var testObj1,
		testObj2,
		testArr;

	testObj1 = {
		arr: [1,2,3]
	}

	testObj2 = {
		arr: [2]
	}

	testArr = [testObj1, testObj2];

	t.plan(3);

	premerge(testArr, function(err, res) {

		t.deepEqual (res.arrays.originals.arr, [[1,2,3],[2]], 'original arrays are still correct');
		t.equal (res.arrays.merge.arr.length, 1, 'merged array has length 1');
		t.equal (res.arrays.merge.arr[0].value, 2, 'value of merged array member is correct');

	})


})


test('premerge works when there is only one value', function(t) {

	var testObj1,
		testObj2,
		testArr;

	testObj1 = {
		foo:'bar'
	}

	testObj2 = {
		foo:''
	}

	testArr = [testObj1, testObj2];

	t.plan(5);

	premerge(testArr, function(err, res) {

		t.deepEqual(res.keyValuePairs.originals, [{foo:'bar'},{foo:''}], 'Originals array is still correct.')
		t.equal(_.keys(res.keyValuePairs.merge).length, 1, 'Merge array has the correct length');
		t.equal(res.keyValuePairs.merge.foo.source, 0, 'Source is the array that originally had the value');
		t.equal(res.keyValuePairs.merge.foo.match, false, 'Match is false');
		t.equal(res.keyValuePairs.merge.foo.value, 'bar', 'Value is equal to the one provided value.')

	})


})

test('premerge works when there are no values', function(t) {

	var testObj1,
		testObj2,
		testArr;

	testObj1 = {
		foo:''
	}

	testObj2 = {
		foo:''
	}

	testArr = [testObj1, testObj2];

	t.plan(5);

	premerge(testArr, function(err, res) {

		t.deepEqual(res.keyValuePairs.originals, [{foo:''},{foo:''}], 'Originals array is still correct.')
		t.equal(_.keys(res.keyValuePairs.merge).length, 1, 'Merge object has the correct length');
		t.equal(res.keyValuePairs.merge.foo.match, false, 'Match is false');
		t.equal(res.keyValuePairs.merge.foo.value, '', 'Value is empty');
		t.equal(res.keyValuePairs.merge.foo.source, '', 'Source is empty');

	})


})

test('values which are \'falsy\' are still merged in', function(t) {
	var testObj1,
		testObj2,
		testArr;

	testObj1 = {
		bool:false
	}

	testObj2 = {
		bool:false
	}

	testArr = [testObj1, testObj2];

	t.plan(5);

	premerge(testArr, function(err, res) {

		t.deepEqual(res.keyValuePairs.originals, [{bool:false},{bool:false}], 'Originals array is still correct.')
		t.equal(_.keys(res.keyValuePairs.merge).length, 1, 'Merge object has the correct length')
		t.equal(res.keyValuePairs.merge.bool.match, true, 'Match is true');
		t.equal(res.keyValuePairs.merge.bool.value, false, 'Value is correct (false)');
		t.equal(res.keyValuePairs.merge.bool.source, 'MATCH', 'Source is \'MATCH\'');

	})
})
