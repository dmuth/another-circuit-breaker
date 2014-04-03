/**
* This package is for keeping track of stats related to the current run of our client (or server).
*/



/**
* Create and return a stats object
*
* @return {object} Our object
*/
exports = module.exports = function() {

	var retval = {};

	//
	// Our stats
	//
	retval.data = {};
	retval.meta_data = {};

	retval.get = get;
	retval.incr = incr;
	retval.decr = decr;
	retval.add = add;
	retval.subAbs = subAbs;
	retval.setAvg = setAvg;
	retval.setStdDev = setStdDev;
	retval.reportTime = reportTime;
	retval.computeStats = computeStats;
	retval.filterLists = filterLists;
	retval.reportStats = reportStats;

	return(retval);

} // End of exports()


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
* Increment a stat
*/
function incr(key) {

	if (!this.data[key]) {
		this.data[key] = 0;
	}

	this.data[key]++;

} // End of incr()


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
* Add a value to a key that is an array.
*/
function add(key, value) {

	if (!this.data[key]) {
		this.data[key] = [];
	}

	this.data[key].push(value);

} // End of exports.add()


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
* Set metadata on this field to be an average of its values.
*/
function setAvg(key) {

	if (!this.meta_data[key]) {
		this.meta_data[key] = {};
	}

	this.meta_data[key]["avg"] = true;

}


/**
* Set metadata on this field to be an average of its values.
*/
function setStdDev(key) {

	if (!this.meta_data[key]) {
		this.meta_data[key] = {};
	}

	this.meta_data[key]["stddev"] = true;

}


/**
* Set up a loop to start reporting stats.
*
* @param {object} cb Optional callback to be fired when stats print
*/
function reportTime(cb) {

	var self = this;

	var delay = 1 * 1000;

	setTimeout(function() {
		self.reportStats(cb);
	}, delay);

} // End of reportTime()


/**
* Compute any averages and/or standard deviations.
*
* @param {object} data Our array of stats data.  This will be modified in place.
*/
function computeStats(data) {

	//
	// Go through our data and compute any averages or other stats.
	//
	for (var k in data) {

		if (this.meta_data[k]) {

			var values = data[k];

			//
			// Determine the average
			//
			if (this.meta_data[k]["avg"]) {


				var sum = 0;
				for (var i = 0; i<values.length; i++) {
					sum += values[i];
				}

				var average = sum / values.length;
				average = Math.floor(average * 1000) / 1000;
				data[k + "-avg"] = average;

				delete data[k];
			}

			//
			// Now determine standard deviation
			//
			if (this.meta_data[k]["stddev"]) {

				var sum = 0;
				for (var i = 0; i<values.length; i++) {
					sum += values[i] * values[i];
				}

				var variance = sum / values.length;
				variance = Math.floor(variance * 1000) / 1000;
				var stddev = Math.sqrt(variance);
				stddev = Math.floor(stddev * 1000) / 1000;

				//local_data[k + "-var"] = variance;
				data[k + "-stddev"] = stddev;

			}

			delete data[k];

		}

	}

} // End of computeStats()


/**
* Filter out any lists we have.
*
* @param {object} data Our array of stats data.  This will be modified in place.
*/
function filterLists(data) {

	for (var k in data) {
		if (Array.isArray(data[k])) {
			delete data[k];
		}
	}

} // End of filterLists()


/**
* Print out our stats, then schedule another run.
*
* @param {object} cb Optional callback to be fired when stats print
*
*/
function reportStats(cb) {

	var local_data = JSON.parse(JSON.stringify(this.data));
	this.computeStats(local_data);
	this.filterLists(local_data);

	var str = JSON.stringify(local_data);
	str = str.replace(/{/, "{ ");
	str = str.replace(/,/g, ", ");
	str = str.replace(/:/g, ": ");
	str = str.replace(/}/, " }");

	if (cb) {
		cb(str);
	} else {
		console.log(str);
	}

	this.reportTime(cb);

} // End of reportStats()




