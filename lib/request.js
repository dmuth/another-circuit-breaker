/**
* This module is used for holding functions that directly handle 
* an incoming request.
*/


var request = require("request");

var stats = require("../stats");


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
exports.handleRequest = function(req, res, url, clever, cb_in) {

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



