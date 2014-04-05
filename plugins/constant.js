/**
* This module implements the "constant" decay algorithm.
* Once every second, the number of errors decays by a specified amount.
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {object} options Our options object
* @param {function} debug Our debugging funciton
*/
exports.go = function(stats, options, debug) {
	
	stats.subAbs("num-errors", options.decayRate);

} // End of go()

