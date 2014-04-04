/**
* This module loads all files from the current directory and makes them 
* available to the loading script.
*/


var fs = require("fs");


exports = module.exports = {};

var files = fs.readdirSync(__dirname);

for (var k in files) {

	var file = files[k];

	if (!file.match(/\.js$/)
		|| file == "index.js"
		) {
		continue;
	}

	var module = require("./" + file);
	var func = module.go;

	var module_name = file.match(/(.*).js$/)[1];

	exports[module_name] = func;
	exports[module_name + ".js"] = func;

}


