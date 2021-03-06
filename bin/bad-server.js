/**
* Our bad server.  This server will periodically go "bad", and responses 
* will take a very long time.
*/


var http = require("http");
var util = require("util");

var express = require("express");
var commander = require("commander");
var winston = require("winston");

var Stats = require("../lib/stats");


//
// Set up logging
//
winston.clear(winston.transports.Console);
winston.add(winston.transports.Console, {
	colorize: true,
	timestamp: true,
	});


//
// Increase our maximum number of sockets
//
http.globalAgent.maxSockets = 10240;


/**
* Start up our webserver.
*/
function startServer(stats, port, data) {

	var app = express();

	app.get("/", function(req, res){

		stats.incr("pending");

		if (data.bad) {
			setTimeout(function() {
				stats.decr("pending");
				stats.incr("results-bad");
				res.send("BAD\n");
				}, data.goBadDelay);

		} else {
			//
			// Even if the state of the server is good, take 100 ms to reply to 
			// simulate a normal remote service.
			//
			setTimeout(function() {
				stats.decr("pending");
				stats.incr("results-good");
				res.send("GOOD\n");
			}, 100);

		}

	});

	var server = app.listen(port, function() {
		winston.info("Listening on port " + port);
	});

} // End of startServer()


/**
* Set our webserver in "bad" mode after a delay.
*/
function timeoutGoBad(data) {

	setTimeout(function() {
		data.bad = true;
		winston.warn("Webserver is now in BAD mode!");
		timeoutGoGood(data);
		}, data.goBadAfter);

} // End of timeoutGoBad()


/**
* Set our webserver in "good" mode after a delay
*/
function timeoutGoGood(data) {

	setTimeout(function() {
		data.bad = false;
		winston.info("Webserver is now in GOOD mode!");
		timeoutGoBad(data);
		}, data.goBadDuration);

} // End of timeoutGoGood()


/**
* Our main entry opint.
*/
function main() {

	var stats = new Stats();

	commander
		.option("--go-bad-after <n>", "Start going bad after n seconds")
		.option("--go-bad-duration <n>", "How long to stay bad for")
		.option("--go-bad-delay <n>", "How many seconds to delay on responses while bad?")
		.parse(process.argv)
		;
	commander.goBadAfter = commander.goBadAfter || 5;
	commander.goBadDuration = commander.goBadDuration || 5;
	commander.goBadDelay = commander.goBadDelay || 5;

	stats.reportTime(function(str) {
		console.log("Bad Server:", str);
		});

	console.log(util.format(
		"Starting server.\nIt will go bad after: %d seconds\n"
	 	+ "It will stay bad for: %d seconds\n"
		+ "While bad the response delay will be: %d seconds\n",
		commander.goBadAfter, commander.goBadDuration, commander.goBadDelay));
	
	var port = 3001;
	var data = {};
	data.goBadAfter = commander.goBadAfter * 1000;
	data.goBadDuration = commander.goBadDuration * 1000;
	data.goBadDelay = commander.goBadDelay * 1000;
	data.bad = false;
	startServer(stats, port, data);

	timeoutGoBad(data);

} // End of main()


main();

