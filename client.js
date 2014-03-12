
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
		.parse(process.argv)
		;

	var url = "http://localhost:3000/";

	var pool = generic_pool.Pool({
		name: "pool",
		create: function(cb) { cb(); },
		destory: function(cb) { cb(); },
		min: 0,
		max: commander.concurrency
		});

	for (var i=0; i<commander.numRequests; i++) {
		pool.acquire(function() {
			request(url, function(error, res, body) {
				if (error) {
					console.log(error);
				} else {
					proccess.stdout.write(".");
				}
				pool.release();
			});
		});

	}

} // End of main()


main();

