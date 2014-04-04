/**
* This module implements the "half" decay algorithm.
* Once every second, the number of errors is cut in half.
*
* Based on my tests, I do NOT recommend you use this in production 
* unless you have thousands of connections of PER SECOND. Otherwise, 
* the error count drops too quickly for it to be useful.
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {float} decayRate Our rate of decay per call.
*/
exports.go = function(stats, decayRate) {

	var num_errors = stats.get("num-errors");
	num_errors /= 2;

	//
	// If the number of errors is less than one, go straight to zero,
	// otherwise we'll have smaller and smaller fractions forever.
	//
	if (num_errors <= 1) {
		stats.set("num-errors", 0);
	}

	stats.set("num-errors", num_errors);

} // End of go()

