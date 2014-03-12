
var commander = require("commander");
var express = require("express");
var request = require("request");


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
			// If we've been here before AND this was called as a response
			// from request(), then this is a "late" reply.
			//
			if (response) {
				process.stdout.write("L");
			}
			return(null);
		}

		process.stdout.write("R");
		res.send("Hello", 200);
		beenhere = true;

	}

	setTimeout(done, 500);

	request(url, function(error, result, body) {

		if (error) {
			console.log(error);
			process.stdout.write("E");
		}

		if (result.statusCode != 200) {
			process.stdout.write("5");
			res.send("Hello", 200);
			return(null);
		}

		process.stdout.write("D");
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
		console.log("Key:");
		console.log("D = Data Received from bad web service");
		console.log("E = Error received from bad web service");
		console.log("R = Response sent to client");
		console.log("L = Late response from bad web service");
		console.log("5 = Error received from the bad web service");
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

	var port = 3000;
	startServer(port, url);

} // End of main()


main();

