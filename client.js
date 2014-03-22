/**
* Our client app.  It will be used for talking to the good server.
*/

var http = require("http");
var util = require("util");

var commander = require("commander");
var generic_pool = require("generic-pool");
var request = require("request");

var stats = require("./stats");


//
// Increase our maximum number of sockets
//
http.globalAgent.maxSockets = 1000;


/**
* Our main entry opint.
*/
function main() {

	commander
		.option("--num-requests <n>", "Number of requests to make")
		.option("--concurrency <n>", "How many requests to make in parallel")
		.option("--url <url>", "The URL of our web server")
		.parse(process.argv)
		;

	commander.numRequests = commander.numRequests || 10;
	commander.concurrency = commander.concurrency || 1;
	commander.url = commander.url || "http://localhost:3000/";

	console.log(util.format(
		"Hammering URL: %s\nNumber of requests: %d\nConcurrency: %d\n",
		commander.url, commander.numRequests, commander.concurrency
		));

	stats.reportTime();

	var pool = generic_pool.Pool({
		name: "pool",
		create: function(cb) { cb(); },
		destroy: function() {  },
		min: 0,
		max: commander.concurrency
		});

	var requests_left = commander.numRequests;

	for (var i=0; i<commander.numRequests; i++) {

		pool.acquire(function() {

			stats.incr("connecting");
			request(commander.url, function(error, res, body) {
				stats.decr("connecting");

				if (error) {
					stats.incr("error");
					stats.incr("error-" + error.errno);
					//console.log(error);

				} else {
					stats.incr("success");

				}

				pool.release();

				requests_left--;
				if (requests_left <= 0) {
					console.log("No requests left to send. Hit Ctrl-C to exit..");
				}

			});

		});

	}

} // End of main()


main();

