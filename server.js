/**
* Our public-facing webserver which talks to a back end service.
*/

var http = require("http");

var commander = require("commander");
var express = require("express");
var request = require("request");

var stats = require("./stats");

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
*
*/
function handleRequest(req, res, url, clever) {

	if (clever) {
		handleRequestClever(req, res, url);

	} else {
		handleRequestNaive(req, res, url);

	}
		
} // End of handleRequest()


/**
* Try to handle our request in a "clever" way.
*/
function handleRequestClever(req, res, url) {

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

		res.send("Hello", 200);

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
			res.send("Error " + JSON.stringify(error), 200);
			stats.incr("http-error-" + error.errno);

		} else {

			if (result.statusCode != 200) {
				stats.incr("http-error-" + result.statusCode);

			} else {
				stats.incr("success");

			}

			res.send("Hello", 200);

		}

		done(true);

	});

} // End of handleRequestClever()


/**
* Try to handle our request in a "naive" way. 
* Simply wait as long as is necessary for the response.
*/
function handleRequestNaive(req, res, url) {


	stats.incr("connecting");

	request(url, function(error, result, body) {
		stats.decr("connecting");

		if (error) {
			//
			// Connection refused or similar sort of error. 
			// We don't expect these during our demo.
			//
			res.send("Error " + JSON.stringify(error), 200);
			stats.incr("http-error-" + error.errno);

		} else {

			if (result.statusCode != 200) {
				stats.incr("http-error-" + result.statusCode);

			} else {
				stats.incr("success");

			}

			res.send("Hello", 200);

		}

	});

} // End of handleRequestNaive()


/**
* Start up our webserver.
*/
function startServer(port, url, clever) {

	var app = express();

	console.log("URL of bad web service is:", url);

	app.get("/", function(req, res) {
		handleRequest(req, res, url, clever);
		});

	var server = app.listen(port, function() {
		console.log("Listening on port " + port);
		if (clever) {
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
		.parse(process.argv)
		;
	var url = commander.url || "http://localhost:3001/";

	stats.reportTime();

	process.on("uncaughtException", function(error) {
		stats.incr("uncaught-exception-" + error.errno);
	});

	var port = 3000;
	startServer(port, url, commander.clever);

} // End of main()


main();

