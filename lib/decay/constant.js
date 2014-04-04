/**
* This module implements the "constant" decay algorithm.
* Once every second, the number of errors decays by a specified amount.
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {float} decayRate Our rate of decay per call.
*/
exports.go = function(stats, decayRate) {
	
	stats.subAbs("num-errors", decayRate);

} // End of go()

