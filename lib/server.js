'use strict';

let restify = require('restify');
let {LoggingLevel, defaultBodyFormatter, RequestStruct, ResponseAction} = require('./api');
let {stringify, omitString} = require('./util/strings');

class MockServer {
    constructor(loggingLevel, bodyFormatter) {
        // logging level
        if (!loggingLevel) {
            loggingLevel = LoggingLevel.NONE;
        }
        this.loggingLevel = loggingLevel;

        // response body formatter
        if (typeof bodyFormatter != 'function') {
            console.warn("You're not specify a response body formatter, so the default formatter will be used")
            bodyFormatter = defaultBodyFormatter
        }
        this.bodyFormatter = bodyFormatter;

        // client request interceptor, only path & method are both correct
        this.routedInterceptors = [];

        // base url
        this.baseUrl = '/';

        // restify server
        const verbose = this.loggingLevel >= LoggingLevel.HEADERS;
        const bodyVerbose = this.loggingLevel >= LoggingLevel.BODY;
        const server = restify.createServer({
            // see http://restify.com/docs/home/
            name: 'restify-mock',
            version: '0.1.0'
        });
        // response content type, first is application/json
        server.use(restify.plugins.acceptParser(server.acceptable));
        server.use(restify.plugins.dateParser());
        server.use(restify.plugins.queryParser());
        server.use(restify.plugins.jsonp());
        server.use(restify.plugins.gzipResponse());
        server.use(restify.plugins.bodyParser());
        // routed unmatched when pre to restifyError
        server.on('restifyError', function (req, res, err, callback) {
            const statusCode = err.statusCode;
            const rs = new RequestStruct(req.getPath(), req.method, req.headers, req.query, req.body);
            const customFormatter = function () {
                return bodyFormatter(statusCode, err.message, rs, undefined);
            };
            err.toJSON = customFormatter;
            err.toString = customFormatter;
            if (bodyVerbose) {
                req.verbose.responseBody = stringify(customFormatter());
            }
            console.error(`${err.code} on ${req.method} ${req.url}: ${err.message}`);
            return callback();
        });

        // after 'pre', match the route
        server.on('routed', function(req, res, route) {
            //before server handler
        });
        // before route, always invoke
        server.on('pre', function (req, res) {
            if (verbose) {
                req.verbose = {};
                let headers = req.headers;
                let record = [];
                record.push(`* Connected to ${server.url}`);
                record.push(`> ${req.method.toUpperCase()} ${req.getPath()} HTTP/${req.httpVersion}`);
                Object.keys(headers).forEach((key) => {
                    record.push(`> ${key}: ${headers[key]}`)
                });
                req.verbose.record = record;
            }
        });
        // after 'routed' and 'restifyError'
        server.on('after', function (req, res, route, err) {
            if (verbose) {
                let headers = res.getHeaders();
                let record = req.verbose.record;
                record.push('>');
                if (bodyVerbose) {
                    record.push(`# ${omitString(req.verbose.requestBody)}`);
                }
                record.push(`< HTTP/${req.httpVersion} ${res.statusCode} ${res.statusMessage}`);
                Object.keys(headers).forEach((key) => {
                    record.push(`< ${key}: ${headers[key]}`)
                });
                record.push('<');
                if (bodyVerbose) {
                    record.push(`# ${omitString(req.verbose.responseBody)}`);
                }
                record.push(`* Closed connection\n`);
                console.log(record.join('\n'));
            }
        });
        this.server = server;
    }
}

module.exports = {
    _MockServer: MockServer,
};
