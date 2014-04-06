
## Circuit Breaker

This module implements the "Circuit Breaker" pattern, which is used to detect failures and prevent a failure from occurring regularly.  A perfect example would be a third-party web service (say, Facebook Graph…) which may perform poorly from time to time, and is completely out of your control.

### The Consequences of undeteted failures

Your app will crash.  If you're lucky.  If you're not lucky, you'll run out of file descriptors and other file or network-based operations in your program will be affected.  If you're **really** unlucky, you'll start hitting the swap space and then run out of RAM, thus ~~unleashing Zalgo~~ the OOM killer which then might kill syslog or worse?  You don't want to be there.


### Usage

    var circuitBreaker = require("./lib/circuitBreaker");
    
    var options = {
        timeout: 5,
        maxFailures: 20,
        min: 0,
        decayAlgorithm: "percent",
        decayRate: 10,
        debug: function(str) { console.log("CircuitBreaker:", str); }
        };
    var breaker = new circuitBreaker(options); // Only run this ONCE
    
    breaker.go(function(cb) {
        //
        // Do your work here, then call cb, optionally with an error.
        // If there were too many errors, this function will NOT be called.
        // cb is a callback within circuitBreaker which will handle any errors, then call the next function
        //
    	
        }, function(error) {
        //
        // This is called when we're all done with the circuitBreaker
        // 

        })

#### Options

The options object can be used to alter the behavior of CircuitBreaker.  These are the options available:

- timeout: Number of seconds after which we'll assume that the first callback timed out, and treat it as an error. (default: 1)
   - Note that there is logic to prevent the callback from being called **after** the timeout callback is fired in the event of a very slow repsonse time.
- maxFailures: Maximum number of failures before the CircuitBreaker is set to "open" (default: 10)
- min: Minimum number of failures before the CircuitBreaker is set to "closed" (default: 0)
- decayAlgorithm: The decay algorithm plugin to use (default: "constant")
- decayRate: The rate of decay, used in some algorithms (default: 1)
- debug: Set to true to see debug messages printed out once every second. Set to a function and the function will be called once every second instead. (default: false)

    
### ""Decaying? What's that?"

In this context, "decaying" means to lower the number of errors stored in CircuitBreaker every second.  This is done so that once a service has thrown errors or timed out too many times, a certain "cooling off period" is enforced, based on the number of errors caught.
    
### Plugins

CircuitBreaker ships with a number of modules included.  Here is the list:

- constant.js - Decay the number of errors at a rate defined by decayRate.  **This is the default, and is generally a good choice.**
- example.js - Sets the number of errors to 1 on each pass.  Don't use this in production.
- half.js - Divides the number of errors in half on each pass.  Not very useful except for VERY high traffic scenarios.
- never.js - Never touch the number of errors. Once the CircuitBreaker is tripped open, it stays open.  Forever. Good for testing.
- percent.js - Decay the number of errors at the percentage rate defined by decayRate.
- zero.js - Set the number of errors to zero instantly.  Not useful for anything other than testing.

Any of these can be chosen with the "decayAlgorithm" option.

### Writing your own Plugins

Existing plugins can be found in the plugins/ directory.  All plugins have this signature function:

    /**
    *
    * @param {object} stats Our stats object
    * @param {object} options Our options object
    *    The decay rate can be accessed as options.decayRate
    * @param {function} debug Our debugging funciton
    *
    */
    function(stats, options, debug)


Want to write a plugin? Start by looking in the file `example.js`. Documentation for the stats system can be found there.  Next, make a copy of that file and start writing your plugin.  Be sure to make liberal use of the development environemnt (described below) and the debug function.


#### Development environment

In order to create scenarios under which CircuitBreaker will be the most useful, I took the liberty of creating a development environment.  That consists of the following files:
- Vagrantfile - Used in conjction with Vagrant to create 3 separate virtual machines: 
   - A "bad_server" which periodically takes a long time to reply to queries
   - A "good_server" which accepts HTTP connections and makes HTTP connections to the bad server, and uses CircuitBreaker
   - A "client", which is used to connect to the good server.
- bin/bad_server.sh - To be run on the "bad server" VM, it starts up the node.js server app.
- bin/good_server.sh - To be run on the "good server" VM, it starts up the good server app. Run with -h for options, such as which CircuitBreaker decay plugin to test.
- bin/client.sh - To be run on the "client" VM, it makes connections to the good server in parallel, to simulate lots of incoming connections from the outside world. Run with -h for options, such as the concurrency level and total number of connections to make.

##### Installing Node.js on each VM

The latest version of Node.js can be installed on each VM by SSHing in (`vagrant ssh (bad_server|good_server|client)`) and running these commands as root:

    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install python-software-properties python g++ make nodejs


### Where to find this project online

- [https://github.com/dmuth/another-circuit-breaker](https://github.com/dmuth/another-circuit-breaker)
- [https://bitbucket.org/dmuth/another-circuit-breaker](https://bitbucket.org/dmuth/another-circuit-breaker)


### Contact

Questions? Complaints? Here's my contact info: [http://www.dmuth.org/contact](http://www.dmuth.org/contact)

