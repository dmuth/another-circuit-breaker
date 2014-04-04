/**
*
* Sample decay module.
*
* This module causes the number of errors to decay straight to zero, 
* thus negating the entire purpose of the circuitBreaker module.
*
* This is only a sample. 
*
* If you use this in production, you're going to have a bad time.
*
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {float} decayRate Our rate of decay per call.
*/
exports.go = function(stats, decayRate) {
	
	stats.set("num-errors", 0);

} // End of go()

