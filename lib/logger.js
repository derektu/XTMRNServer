var log4js = require('log4js');

log4js.configure({
    appenders: {
        out: { type: 'console' },
        app: { type: 'dateFile', filename: 'logs/server.log' }
    },
    categories: {
        default: { appenders: [ 'out', 'app' ], level: 'debug' }
    }
});

module.exports = log4js;
