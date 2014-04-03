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

	retval.incr = incr;
	retval.decr = decr;
	retval.add = add;
	retval.setAvg = setAvg;
	retval.setStdDev = setStdDev;
	retval.reportTime = reportTime;
	retval.computeStats = computeStats;
	retval.filterLists = filterLists;
	retval.reportStats = reportStats;

	return(retval);

} // End of exports()


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
*/
function reportTime() {

	var self = this;

	var delay = 1 * 1000;

	setTimeout(function() {
		self.reportStats();
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
*/
function reportStats() {

	var local_data = JSON.parse(JSON.stringify(this.data));
	this.computeStats(local_data);
	this.filterLists(local_data);

	var str = JSON.stringify(local_data);
	str = str.replace(/{/, "{ ");
	str = str.replace(/,/g, ", ");
	str = str.replace(/:/g, ": ");
	str = str.replace(/}/, " }");
	console.log(str);
	this.reportTime();

}




