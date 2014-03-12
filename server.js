
var commander = require("commander");
var express = require("express");
var request = require("request");


/**
* Start up our webserver.
*/
function startServer(port, remote_port) {

	var app = express();
	var url = "http://localhost:" + remote_port + "/";

	app.get("/", function(req, res){

		process.stdout.write("C");

		request(url, function(error, result, body) {
			if (error) {
				console.log(error);
				process.stdout.write("E");
			}

			process.stdout.write("R");

			res.send("Hello", 200);

		});
		
	});

	var server = app.listen(port, function() {
		console.log("Listening on port " + port);
	});

} // End of startServer()


/**
* Our main entry opint.
*/
function main() {

	var port = 3000;
	var remote_port = 3001;
	startServer(port, remote_port);

} // End of main()


main();

