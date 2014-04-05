/**
*
* Sample decay module.
*
* Feel free to make a copy of this and hack it however you like.
*
* Each time this module is called, the number of errors is decreased by 1.
*
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {object} options Our options object
* @param {function} debug Our debugging funciton
*/
exports.go = function(stats, options, debug) {
	
	//
	// decayRate would be useful in other modules, but not this one :-)
	//

	//
	// Stats is a refernce to our stats object, found in lib/stats.js
	//
	// It has a number of useful methods including get(), set(), incr, and decr()
	// subAbs is a special method that will subtract a number, but not go 
	// below zero
	//

	stats.subAbs("num-errors", 1);

} // End of go()

