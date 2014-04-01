/**
* This package is for keeping track of stats related to the current run of our client (or server).
*/

//
// Our stats
//
var data = {};
var meta_data = {};


/**
* Increment a stat
*/
exports.incr = function(key) {

	if (!data[key]) {
		data[key] = 0;
	}

	data[key]++;

} // End of incr()


/**
* Decrement a stat.
*/
exports.decr = function(key) {

	if (!data[key]) {
		data[key] = 0;
	}

	data[key]--;

} // End of decr()


/**
* Add a value to a key that is an array.
*/
exports.add = function(key, value) {

	if (!data[key]) {
		data[key] = [];
	}

	data[key].push(value);

} // End of exports.add()


/**
* Set metadata on this field to be an average of its values.
*/
exports.setAvg = function(key) {

	if (!meta_data[key]) {
		meta_data[key] = {};
	}

	meta_data[key]["avg"] = true;

}


/**
* Set metadata on this field to be an average of its values.
*/
exports.setStdDev = function(key) {

	if (!meta_data[key]) {
		meta_data[key] = {};
	}

	meta_data[key]["stddev"] = true;

}


/**
* Set up a loop to start reporting stats.
*/
exports.reportTime = function() {

	var delay = 1 * 1000;

	setTimeout(function() {
		reportStats();
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

		if (meta_data[k]) {

			var values = data[k];

			//
			// Determine the average
			//
			if (meta_data[k]["avg"]) {


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
			if (meta_data[k]["stddev"]) {

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

	var local_data = JSON.parse(JSON.stringify(data));
	computeStats(local_data);
	filterLists(local_data);

	var str = JSON.stringify(local_data);
	str = str.replace(/{/, "{ ");
	str = str.replace(/,/g, ", ");
	str = str.replace(/:/g, ": ");
	str = str.replace(/}/, " }");
	console.log(str);
	exports.reportTime();

}




