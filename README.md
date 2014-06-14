#JSON-Merge

This programs compares JSON objects and prints out a diff as a first step in an arbitartion and QA workflow for double blind data collection. The diff object contains copies of the original objects and a  template designed to hold the eventual result of the manual QA.

## Installation

	$ git clone https://github.com/owenscott/json-merge

	var merge = require('./json-merge');

## Example 1

Comparing two objects with one matching value and one non-matching value.

	var example1 = [
		{
			foo:'bar',
			something:'value'
		},
		{
			foo:'bar',
			something:'different value'
		}
	]

	merge (example1, function(err, res) {
		console.log(res);
	})

	//result:
	//
	// { a: { foo: 'bar', something: 'value' },
	//   b: { foo: 'bar', something: 'different value' },
	// 	merge : {
	// 		foo : {
	// 			match : true,
	// 			source : 'MATCH',
	// 			value : 'bar',
	// 			cleanValue : '',
	// 			deleted : false
	// 		},
	// 		something : {
	// 			match : false,
	// 			source : '',
	// 			value : '',
	// 			cleanValue : '',
	// 			deleted : false
	// 		}
	// 	}
	// }

## Example 2

Comparing two objects which contain an array inside one of the key-value pairs.

	var example2 = [
		{
			foo:'bar',
			something:[1,2,3,4,5]
		},
		{
			foo:'bar',
			something:[1,4]
		}
	]

	merge (example2, function(err, res) {
		console.log(res);
	})

	//result:
	//
	// {
	// 	"a" : {
	// 		"foo" : "bar",
	// 		"something" : [1, 2, 3, 4, 5]
	// 	},
	// 	"b" : {
	// 		"foo" : "bar",
	// 		"something" : [1, 4]
	// 	},
	// 	"merge" : {
	// 		"foo" : {
	// 			"match" : true,
	// 			"source" : "MATCH",
	// 			"value" : "bar",
	// 			"cleanValue" : "",
	// 			"deleted" : false
	// 		}
	// 	},
	// 	"arrays" : {
	// 		"something" : {
	// 			"merge" : [{
	// 					"match" : true,
	// 					"source" : "MATCH",
	// 					"value" : 1,
	// 					"cleanValue" : "",
	// 					"deleted" : false
	// 				}, {
	// 					"match" : true,
	// 					"source" : "MATCH",
	// 					"value" : 4,
	// 					"cleanValue" : "",
	// 					"deleted" : false
	// 				}
	// 			],
	// 			"a" : [2, 3, 5],
	// 			"b" : []
	// 		}
	// 	}
	// }

