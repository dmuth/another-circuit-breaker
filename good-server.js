/**
* Our public-facing webserver which talks to a back end service.
*/

var http = require("http");

var commander = require("commander");
var express = require("express");

var circuitBreaker = require("./lib/circuitBreaker");
var Stats = require("./lib/stats");
var request = require("./lib/request");


//
// Increase our maximum number of sockets
//
http.globalAgent.maxSockets = 10240;


/**
* Start up our webserver.
*/
function startServer(stats, port, commander) {

	var app = express();

	console.log("URL of bad web service is:", commander.url);

	var options = {};
	options.timeout = commander.circuitBreakerTimeout;
	options.maxFailures = commander.circuitBreakerMaxFailures;
	options.min = commander.circuitBreakerMin;
	options.decayRate = commander.circuitBreakerDecayRate;
	options.decayAlgorithm = commander.circuitBreakerDecayAlgorithm;
	options.debug = true;
	//options.debug = function(str) { console.log("CB DEBUG:", str); };

	var breaker = new circuitBreaker(options);

	app.get("/", function(req, res) {

		if (commander.circuitBreaker) {
			breaker.go(function(cb) {
				request.handleRequest(
				req, res, stats, commander.url, commander.clever, cb);
				},
			function(error) {
				//console.log("After!", error); // Debugging
				res.send("Hello", 200);
				});

		} else {
			request.handleRequest(
				req, res, stats, commander.url, commander.clever, function() {
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

	var stats = new Stats();

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
		.option("--circuit-breaker-decay-algorithm <string>", 
			"Which decay algorithm to use? Can be \"constant\" or \"percent\".")
		.option("--circuit-breaker-decay-rate <n>",
			"Errors drop by this rate (number or percent) per second.")
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
	commander.circuitBreakerDecayAlgorithm = commander.circuitBreakerDecayAlgorithm;
	commander.circuitBreakerDecayRate = commander.circuitBreakerDecayRate || 1;

	if (commander.statsAvg) {
		stats.setAvg("request_time");
	}

	if (commander.statsStddev) {
		stats.setStdDev("request_time");
	}

	stats.reportTime(function(str) {
		console.log("Good Server:", str);
		});

	process.on("uncaughtException", function(error) {
		//console.log(error, JSON.stringify(error)); // Debugging
		stats.incr("uncaught-exception-" + error.errno);
	});

	var port = 3000;
	startServer(stats, port, commander);

} // End of main()


main();

