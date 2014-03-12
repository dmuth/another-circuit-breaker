
var commander = require("commander");
var generic_pool = require("generic-pool");
var request = require("request");


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

	var url = commander.url || "http://localhost:3000/";

	console.log("Hammering URL:", url);

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

			request(url, function(error, res, body) {

				if (error) {
					console.log(error);
				} else {
					process.stdout.write(".");
				}

				pool.release();

				requests_left--;
				if (requests_left <= 0) {
					process.exit(0);
				}

			});

		});

	}

} // End of main()


main();

