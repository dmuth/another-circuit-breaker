/**
* This module implements the circuit breaker pattern.
* It create an object will which catch errors and and suspend further 
* operations once a threshold has been reached.
*/


var decay_constant = require("./decay/constant");
var decay_pecent = require("./decay/percent");
var Stats = require("./stats");


/**
* Create and return an object that implements the circuit breaker pattern.
*
* @param {object} options Our options
*
* @return {object} Our object
*/
exports = module.exports = function(options) {

	var retval = {};

	retval.options = {};
	retval.options.timeout = options.timeout * 1000 || 10000;
	retval.options.maxFailures = options.maxFailures || 10;
	retval.options.min = options.min || 0;
	retval.options.decayRate = options.decayRate || 1;
	retval.options.decayAlgorithm = options.decayAlgorithm || "constant";
	retval.options.debug = options.debug || false;

	//
	// Sanity check on our decay algoritm.
	//
	if (retval.options.decayAlgorithm != "constant"
		&& retval.option.decayAlgortithm != "percent") {
		retval.options.decayAlgorithm = "constant";
	}

	//
	// Is circuit breaker in a closed state?
	//
	retval.closed = true;

	//
	// Our data for stats
	//
	retval.stats = new Stats();

	//
	// Define our methods
	//
	retval.setClosed = setClosed;
	retval.decay = decay;
	retval.debug = debug;
	retval.checkResults = checkResults;

	retval.decay();

	if (retval.options.debug) {
		retval.stats.reportTime(function(str) {
			retval.debug(str);
			});
		retval.debug("Instantiating Circuit Breaker with these options: " 
			+ JSON.stringify(retval.options));
	}


	/**
	* This function schedules our passed in function for execution, and catches the result.
	*
	* @param {object} cb_wrapped The function we are wrapping
	* @param {object} cb_final Our callback to fire after success or failure
	*
	*/
	retval.go = function(cb_wrapped, cb_final) {

		var self = this;
		var beenhere = false;

		if (self.closed) {

			setTimeout(function() {
				//
				// If we haven't set beenhere yet, then a timeout has 
				// occurred. Fire our callbacks with an error.
				//
				if (!beenhere) {
					//console.log("Timeout"); // Debugging
					beenhere = true;
					error = "timeout";
					self.checkResults(error, self);
					cb_final(error);
				}

				}, retval.options.timeout);

			cb_wrapped(function(error) {
				if (!beenhere) {
					beenhere = true;
					self.checkResults(error, self);
					cb_final(error);

				} else {
					//
					// Late response, do nothing as our callback 
					// has already fired.
					//
				}

				});

		} else {
			self.stats.incr("circuit-was-closed");
			cb_final("Circuit is closed!");

		}

	} // End of go()


	return(retval);

} // End of exports()


/**
* Set the closed state of this circuit breaker
*/
function setClosed(closed) {
	this.closed = closed;
}


/**
* Print out debugging information.
*/
function debug(str) {

	if (this.options.debug) {
		if (this.options.debug === true) {
			console.log("CircuitBreaker: " + str);
		} else {
			this.options.debug(str);
		}
	}

} // End of debug()


/**
* Our callback that is fired by whatever our circuitbreaker called.
* 
* @param {object} error Set if there is an error
* @param {object} self Our current object
*/
function checkResults(error, self) {

	if (error) {
		self.stats.incr("num-errors");
	}

	if (self.closed) {
		if (self.stats.get("num-errors") >= self.options.maxFailures) {
			self.debug("Num errors >= " + self.options.maxFailures 
				+ ", opening circuit");
			self.setClosed(false);
		}
	}

} // End of checkResults()


/**
* Cause our error rate to decay by a specified rate each second.
*/
function decay() {

	var self = this;
	setTimeout(function() {

		self.stats.subAbs("num-errors", self.options.decayRate);

		if (!self.closed) {
			if (self.stats.get("num-errors") <= self.options.min) {
				self.debug("Num errors <= " + self.options.min
					+ ", closing circuit!");
				self.setClosed(true);
			}
		}

		self.decay();
	}, 1000);

} // End of decay()




