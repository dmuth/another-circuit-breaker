/**
* Our public-facing webserver which talks to a back end service.
*/

var http = require("http");

var commander = require("commander");
var express = require("express");
var request = require("request");

var circuitBreaker = require("./lib/circuitBreaker");
var stats = require("./stats");
var request_local = require("./lib/request");


//
// Increase our maximum number of sockets
//
http.globalAgent.maxSockets = 10240;


/**
* Handle a request that comes in.
*
* @param {object} req Our request object
* @param {object} res Our response object
* @param {string} url The URL of the bad web service
* @param {boolean} clever Do we want to be "clever" when waiting on a 
*	response from the bad server? This is useful when we want to make 
*	connections to the bad server
* @param {object} cb_in Our callback
*
*/
function handleRequest(req, res, url, clever, cb_in) {

	//
	// Callback to determine amount of time spent
	//
	var start = new Date().getTime();
	function cb(error) {
		var finish = new Date().getTime();
		var diff = (finish - start) / 1000;
		stats.add("request_time", diff);
		cb_in(error);
	}

	if (clever) {
		handleRequestClever(req, res, url, cb);

	} else {
		handleRequestNaive(req, res, url, cb);

	}
		
} // End of handleRequest()


/**
* Try to handle our request in a "clever" way.
*/
function handleRequestClever(req, res, url, cb) {

	//
	// This is something an overly clever node.js programmer might do.
	// Make the request respond after 500ms through use of setTimeout()
	// and some clever booleans.
	//

	var beenhere = false;

	var done = function(response) {

		if (beenhere) {
			//
			// Too little, too late.
			// But to be fair, that means we already heard back from the server.
			//
			return(null);
		}

		beenhere = true;

		if (!response) {
			stats.incr("bad-server-timeout");
		}

		//res.send("Hello", 200);
		cb("bad-server-timeout");

	}

	setTimeout(done, 500);

	stats.incr("connecting");

	request(url, function(error, result, body) {
		stats.decr("connecting");

		if (error) {
			//
			// Connection refused or similar sort of error. 
			// We don't expect these during our demo.
			//
			//res.send("Error " + JSON.stringify(error), 200);
			stats.incr("http-error-" + error.errno);
			cb("http-error-" + error.errno);

		} else {

			if (result.statusCode != 200) {
				stats.incr("http-error-" + result.statusCode);
				//res.send("Hello", 200);
				cb("http-error-" + result.statusCode);

			} else {
				stats.incr("success");
				//res.send("Hello", 200);
				cb();

			}

		}

		done(true);

	});

} // End of handleRequestClever()


/**
* Try to handle our request in a "naive" way. 
* Simply wait as long as is necessary for the response.
*/
function handleRequestNaive(req, res, url, cb) {

	stats.incr("connecting");

	request(url, function(error, result, body) {
		stats.decr("connecting");

		if (error) {
			//
			// Connection refused or similar sort of error. 
			// We don't expect these during our demo.
			//
			//res.send("Error " + JSON.stringify(error), 200);
			stats.incr("http-error-" + error.errno);
			cb("http-error-" + error.errno);

		} else {

			if (result.statusCode != 200) {
				stats.incr("http-error-" + result.statusCode);
				//res.send("Hello", 200);
				cb("http-error-" + result.statusCode);

			} else {
				stats.incr("success");
				//res.send("Hello", 200);
				cb();

			}

		}

	});

} // End of handleRequestNaive()


/**
* Start up our webserver.
*/
function startServer(port, commander) {

	var app = express();

	console.log("URL of bad web service is:", commander.url);

	var options = {};
	options.timeout = commander.circuitBreakerTimeout;
	options.maxFailures = commander.circuitBreakerMaxFailures;
	options.min = commander.circuitBreakerMin;
	options.decayRate = commander.circuitBreakerDecayRate;
	options.debug = true;

	var breaker = new circuitBreaker(options);

	app.get("/", function(req, res) {

		if (commander.circuitBreaker) {
			breaker.go(function(cb) {
				handleRequest(req, res, commander.url, commander.clever, cb);
				},
			function(error) {
				//console.log("After!", error); // Debugging
				res.send("Hello", 200);
				});

		} else {
			handleRequest(req, res, commander.url, commander.clever, function() {
				res.send("Hello", 200);
				});

		}

		});

	var server = app.listen(port, function() {
		console.log("Listening on port " + port);

		if (commander.clever) {
			console.log("Handling requests in a 'clever' manner. "
			+ "(Return HTTP 200 after 500 timeout.)"
			);

		} else {
			console.log("Handling requests in a 'naive' manner.");

		}

		console.log();
	});

} // End of startServer()


/**
* Our main entry opint.
*/
function main() {

	commander
		.option("--url <url>", "Url of the bad web service")
		.option("--clever", "Be 'clever' when handling timeouts from the bad service")
		.option("--stats-avg", "Compute average response time")
		.option("--stats-stddev", "Compute standard deviation in response time")
		.option("--circuit-breaker", "Use the 'circuit breaker' functionality")
		.option("--circuit-breaker-timeout", "Max length of a request in seconds")
		.option("--circuit-breaker-max-failures <n>", 
			"Number of failures before tripping the circuit breaker")
		.option("--circuit-breaker-min <n>", 
			"Failures must be below this number before retrying on an open circuit")
		.option("--circuit-breaker-decay-rate <n>",
			"Errors drop by this number per second")
		.parse(process.argv)
		;
	//console.log(commander); // Debugging

	//
	// Set defaults
	//
	commander.url = commander.url || "http://localhost:3001/";
	commander.circuitBreakerTimeout = commander.circuitBreakerTimeout || 1;
	commander.circuitBreakerMaxFailures = commander.circuitBreakerMaxFailures || 10;
	commander.circuitBreakerMin = commander.circuitBreakerMin || 0;
	commander.circuitBreakerDecayRate = commander.circuitBreakerDecayRate || 1;

	if (commander.statsAvg) {
		stats.setAvg("request_time");
	}

	if (commander.statsStddev) {
		stats.setStdDev("request_time");
	}

	stats.reportTime();

	process.on("uncaughtException", function(error) {
		//console.log(error, JSON.stringify(error)); // Debugging
		stats.incr("uncaught-exception-" + error.errno);
	});

	var port = 3000;
	startServer(port, commander);

} // End of main()


main();

