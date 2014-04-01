/**
* This module implements the circuit breaker pattern.
* It create an object will which catch errors and and suspend further 
* operations once a threshold has been reached.
*/


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
	retval.options.timeout = options.timeout * 1000;
	retval.options.maxFailures = options.maxFailures;
	retval.options.min = options.min;
	retval.options.decayRate = options.decayRate;
	retval.options.debug = options.debug;

	//
	// Is circuit breaker in a closed state?
	//
	retval.closed = true;

	//
	// Our data for stats
	//
	retval.data = {};

	//
	// Define our methods
	//
	retval.incr = incr;
	retval.decr = decr;
	retval.subAbs = subAbs;
	retval.get = get;
	retval.reportTime = reportTime;
	retval.reportStats = reportStats;
	retval.decay = decay;
	retval.debug = debug;
	retval.checkResults = checkResults;

	retval.decay();

	if (retval.options.debug) {
		retval.reportTime();
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
			self.incr("circuit-was-closed");
			cb_final("Circuit is closed!");

		}

	} // End of go()


	return(retval);

} // End of exports()


/**
* Print out debugging information.
*/
function debug(str) {

	if (this.options.debug) {
		console.log("CircuitBreaker: " + str);
	}

} // End of debug()


/**
* Set up a loop to start reporting stats.
*/
function reportTime() {

	var delay = 1 * 1000;
	var self = this;

	setTimeout(function() {
		self.reportStats();
	}, delay);

} // End of reportTime()


/**
* Print out our stats, then schedule another run.
*/
function reportStats() {

	var local_data = JSON.parse(JSON.stringify(this.data));

	var str = JSON.stringify(local_data);
	str = str.replace(/{/, "{ ");
	str = str.replace(/,/g, ", ");
	str = str.replace(/:/g, ": ");
	str = str.replace(/}/, " }");
	this.debug("CircuitBreaker: " + str);
	this.reportTime();

} // End of reportStats()


/**
* Decrement a stat.
*/
function decr(key) {

	if (!this.data[key]) {
		this.data[key] = 0;
	}

	this.data[key]--;

} // End of decr()


/**
* Increment a stat
*/
function incr(key, value) {

	if (!this.data[key]) {
		this.data[key] = 0;
	}

	this.data[key]++;

} // End of incr()


/**
* Subtract a value from our key.
* This is an aboslute number, so the value never drops below zero.
*/
function subAbs(key, value) {

	if (!this.data[key]) {
		this.data[key] = 0;
		return(null);
	}

	this.data[key] -= value;

	if (this.data[key] < 0) {
		this.data[key] = 0;
	}

} // End of subAbs()


/**
* Retrieve a stat.
*/
function get(key) {

	var retval = 0;
	if (this.data[key]) {
		retval = this.data[key];
	}

	return(retval);

} // End of get()


/**
* Our callback that is fired by whatever our circuitbreaker called.
* 
* @param {object} error Set if there is an error
* @param {object} self Our current object
*/
function checkResults(error, self) {

	if (error) {
		self.incr("num-errors");
	}

	if (self.closed) {
		if (self.get("num-errors") >= self.options.maxFailures) {
			self.debug("Num errors >= " + self.options.maxFailures 
				+ ", opening circuit");
			self.closed = false;
		}
	}

} // End of checkResults()


/**
* Cause our error rate to decay by a specified rate each second.
*/
function decay() {

	var self = this;
	setTimeout(function() {
		self.subAbs("num-errors", self.options.decayRate);

		if (!self.closed) {
			if (self.get("num-errors") <= self.options.min) {
				self.debug("Num errors <= " + self.options.min
					+ ", closing circuit!");
				self.closed = true;
			}
		}

		self.decay();
	}, 1000);

} // End of decay()




