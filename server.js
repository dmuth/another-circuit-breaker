
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

	process.stdout.write("C");

	request(url, function(error, result, body) {
		if (error) {
			console.log(error);
			process.stdout.write("E");
		}

		process.stdout.write("R");

		res.send("Hello", 200);

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

