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
http.globalAgent.maxSockets = 1000;


/**
* Handle a request that comes in.
*
* @param {object} req Our request object
* @param {object} res Our response object
* @param {string} url The URL of the bad web service
*/
function handleRequest(req, res, url) {

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
			//
			return(null);
		}

		if (!response) {
			stats.incr("bad-server-timeout");

		}

		res.send("Hello", 200);
		beenhere = true;

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

		}

		done(true);

	});
		
} // End of handleRequest()


/**
* Start up our webserver.
*/
function startServer(port, url) {

	var app = express();

	console.log("URL of bad web service is:", url);

	app.get("/", function(req, res) {
		handleRequest(req, res, url);
		});

	var server = app.listen(port, function() {
		console.log("Listening on port " + port);
		console.log();
	});

} // End of startServer()


/**
* Our main entry opint.
*/
function main() {

	commander
		.option("--url <url>", "Url of the bad web service")
		.parse(process.argv)
		;
	var url = commander.url || "http://localhost:3001/";

	stats.reportTime();

	var port = 3000;
	startServer(port, url);

} // End of main()


main();

