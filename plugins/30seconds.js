/**
*
* Sample decay module.
*
* Feel free to make a copy of this and hack it however you like.
*
* Each time this module is called, the number of errors is decreased by 1.
*
*/


//
// Our timestamp of when we started the circuit breaker
//
var start = 0;


/**
* Cause our error rate to decay by a specified rate each call.
*
* @param {object} stats Our stats object
* @param {float} decayRate Our rate of decay per call.
*/
exports.go = function(stats, decayRate) {

	if (!start) {
		//
		// First pass here?  Note the time.
		//
		start = new Date().getTime() / 1000;

	} else {
		//
		// Note the first pass?  Note how much time has elapsed.
		// If more than 30 seconds, set errors to zero so
		// the circuit breaker closes again.
		var diff = (new Date().getTime() / 1000) - start;

		if (diff >= 30) {
			stats.set("num-errors", 0);
		}

	}
		
} // End of go()

