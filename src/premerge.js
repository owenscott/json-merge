var _ = require('underscore'),
	createMergedObject;

createMergedObject = function(value) {
	
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


module.exports = function(data, callback) {

	var err,
	matchingKeys,
	k,
	i,
	key,
	aVal,
	bVal,
	mergeArray,
	intersection,
	aDif,
	bDif,
	result = {};

	//data should be a length 2 array which contains the objects to be compared
	if (data.length !== 2 ) {
		err = new Error('Premerge not called with a length 2 array.');
	} 

	result.a = _.clone(data[0]);
	result.b = _.clone(data[1]);
	result.merge = {};

	//only care about matching keys, since expecting identically structured objects
	matchingKeys = _.union( _.keys(result.a), _.keys(result.b) );

	//TODO: if structure of input objects isn't the same throw an error

	//go through each of the matching keys
	for (k in matchingKeys) {

		//setup aVal and bVal as values to be compared
		key = matchingKeys[k];
		aVal = result.a[matchingKeys[k]];
		bVal = result.b[matchingKeys[k]];

		//special handling it it's an array
		if ( Array.isArray(aVal) || Array.isArray(bVal) )  {
			//throw an error if one isn't an array
			if ( !Array.isArray(aVal) || !Array.isArray(bVal) ) {
				err = new Error('Objects have a matching key where only one value is an array');
			}
			else {
				result.arrays = result.arrays || {};
				result.arrays[key] = {};
				mergeArray = []
				intersection = _.intersection(aVal, bVal);
				// aDif = _.difference(aVal, bVal);
				// bDif = _.difference(bVal, aVal);
				for (i in intersection) {
					mergeArray.push(createMergedObject(intersection[i]));
				}
				result.arrays[key].merge = _.clone(mergeArray);
				result.arrays[key].a = _.difference (aVal, _.pluck(mergeArray, 'value'));
				result.arrays[key].b = _.difference (bVal, _.pluck(mergeArray, 'value'));	
				//TODO: handle things
			}
		}
		//otherwise if it's an object or literal check for equality
		else {
			if ( aVal === bVal || _.isEqual(aVal, bVal) ) {
				result.merge[key] = createMergedObject(aVal);
			}
			else {
				result.merge[key] = createMergedObject();
			}
		}
	}

	setImmediate(callback, err || null, result );

}





