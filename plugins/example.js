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
* This function is called periodically (likely once per second) by the 
*	circuit breaker once the number of errors goes above zero.  Once the 
*	"num-errors" value in the stats is set to zero, the function will 
*	no longer be called.
*
* @param {object} stats Our stats object
*
*	The relavent methods in the stats object are listed below:
*
*	get(key) - Get a key's value
*	set(key, value) - Set a key's value
*	incr(key) - Increment a key's value
*	decr(key) - Deccrement a key's value
*	add(key, value) - Add a value to a key
*	subAbs(key, value) - Subtract a value from a key's value, 
*		but don't go below zero
*
*
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

