/**
* This package is for keeping track of stats related to the current run of our client (or server).
*/

//
// Our stats
//
var data = {};


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
* Set up a loop to start reporting stats.
*/
exports.reportTime = function() {

	var delay = 1 * 1000;

	setTimeout(function() {
		reportStats();
	}, delay);

} // End of reportTime()


/**
* Print out our stats, then schedule another run.
*/
function reportStats() {
	var str = JSON.stringify(data);
	str = str.replace(/{/, "{ ");
	str = str.replace(/,/g, ", ");
	str = str.replace(/:/g, ": ");
	str = str.replace(/}/, " }");
	console.log(str);
	exports.reportTime();
}



