//TODO: lots of duplicated code that is prime for refactoring

var _ = require('underscore'),
	createMergedObject;


module.exports = function(data, callback) {

	var err,
	dataKeys = [],
	key,
	result = {};

	//get all keys that are present in the objects provided
	_.each(data, function(d) {
		dataKeys = _.uniq(dataKeys.concat(_.keys(d)));
	});

	//go through each of the matching keys
	dataKeys.forEach( function(key) {

		var values,
			uniqueValues,
			valueIsArray;

		values = _.compact(_.pluck(data, key));
		uniqueValues = _.uniq(values);

		valueIsArray = _.chain(values).map(function(v) {return _.isArray(v)}).uniq().value();

		//check if it has both arrays and non-arrays
		if (valueIsArray.length > 1) {
			//TODO: convert non-arrays to arrays
			throw new Error('Key ' + key + ' has mix of array and non-array values.');
		}
		else if (valueIsArray[0] === true) {

			//=====================HANDLING FOR ARRAYS===========================
			result = mergeKeyWithArrays({
				data:data,
				key:key,
				values:values,
				result:result
			});
			//===================================================================

		}

		else {

			//=====================HANDLING FOR KVPs=============================
			result = mergeKeyWithValues({
				data:data,
				key:key,
				values:values,
				uniqueValues:uniqueValues,
				result:result
			});
			//===================================================================

		}
		
	});

	//run the user-supplied callback with the result
	setImmediate(callback, err || null, result );

}


function createMergedObject(value) {
	
	var mergedObj = {
		match:false,
		source:'',
		value: '',
		cleanValue:'',
		deleted: false
	}

	if (value) {
		mergedObj.match = true;
		mergedObj.source = 'MATCH';
		mergedObj.value = value;
	}

	return mergedObj;

}


function mergeKeyWithValues(input) {

	var	data = input.data,
		key = input.key,
		values = input.values,
		uniqueValues = input.uniqueValues,
		result = input.result

	result.keyValuePairs = result.keyValuePairs || {};
	result.keyValuePairs.merge = result.keyValuePairs.merge || {};
	result.keyValuePairs.originals = result.keyValuePairs.originals || [];
	
	//store original values
	data.forEach(function(d, i , data) {
		result.keyValuePairs.originals[i] = result.keyValuePairs.originals[i] || {};
		result.keyValuePairs.originals[i][key] = d[key];
	})

	//check if no values
	if (values.length === 0) {

	}
	//check if only one value
	else if (values.length === 1) {

	}
	//check if all the values are the same
	else if (uniqueValues.length === 1) {
		result.keyValuePairs.merge[key] = createMergedObject(_.clone(uniqueValues)[0])
	}
	//assume that values exist but aren't matched
	else {
		result.keyValuePairs.merge[key] = createMergedObject();
	}

	return result;

}


function mergeKeyWithArrays(input) {

	var	data = input.data,
		key = input.key,
		values = input.values,
		result = input.result,
		uniqueValues;

	result.arrays = result.arrays || {};
	result.arrays.merge = result.arrays.merge || [];
	result.arrays.originals = result.arrays.originals || [];

	//push values that appear in every array into the match array
	uniqueValues = _.intersection.apply(this, values);
	uniqueValues.forEach(function(value) {
		result.arrays.merge.push(createMergedObject(value));
	})

	//push all arrays into the originals array
	values.forEach(function(value) {
		result.arrays.originals.push(value);
	})

	return result;

}