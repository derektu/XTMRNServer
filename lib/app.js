"use strict";

const logger = require('./logger').getLogger('[App]');
const WebServer = require('./webserver');

var _argopt = {
    default : {
        port: 8899
    }
};

/**
 * Main entry point: start up API server
 */
class App {
    /*
        $ node.js lib/app.js --port=8899
     */
    run(args) {
        var argv = require('minimist')(args, _argopt);
        var port = parseInt(argv['port']) || 8899;
        
        if (!port) {
            this.usage();
            process.exit(1);
        }

        var webServer = new WebServer();
        webServer.start(port);
    }

    usage() {
        console.log('Usage:');
        console.log(`
            $ node.js lib/app.js --port=8899
        `);
    }
}

var app = new App();
app.run(process.argv.slice(2));
