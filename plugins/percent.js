/**
* This module implements the "perecent" decay algorithm.
* Once every second, the number of errors decays by a specified percent.
*/


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {float} decayRate Our rate of decay per call.
*/
exports.go = function(stats, decayRate) {

	var num_errors = stats.get("num-errors");
	var percent = decayRate * .01;
	var num_decay = num_errors * percent;

	//
	// If the number of errors is less than one, go straight to zero,
	// otherwise we'll have smaller and smaller fractions forever.
	//
	if (num_errors <= 1) {
		stats.set("num-errors", 0);
	}

	stats.subAbs("num-errors", num_decay);

} // End of go()

