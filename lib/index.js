'use strict';

const fs = require('fs');
const {randomClone, isEmptyOrFalse} = require('./util/objects');
const {omitString, stringify} = require('./util/strings');
const {compare} = require('./compare');
const {getHandler} = require('./handle');
const MockServer = require('./server')._MockServer;
const {
    LoggingLevel,
    RequestStruct,
    ResponseAction,
    createHttpBasicInterceptor,
    defaultBodyFormatter,
    createAuthorizationInterceptor
} = require('./api');
const {handleCORS} = require('./http');

MockServer.prototype.serve = function (routes, port) {
    const bodyVerbose = this.loggingLevel >= LoggingLevel.BODY;
    const server = this.server;
    const bodyFormatter = this.bodyFormatter;
    const routedInterceptors = this.routedInterceptors;
    const baseUrl = this.baseUrl;

    const handleRoute = function (route) {
        let path = baseUrl + route.path;
        // replace [/]+ to /, such as /// to /
        path = path.replace(/\/+/g, '/');
        let method = route.method;
        let query = route.query;
        let request = route.request;
        let params = route.params;
        let response = route.response;
        if (!response || !Object.keys(response)) {
            response = {};
        }

        if (!method) {
            method = route.request ? 'post' : 'get';
        }
        method = method.toLowerCase();
        let handle = getHandler(server, method);
        if (params) {
            if (query || request) {
                console.warn(`You already defined "params" in routeConfig, 
                    so I'll ignore "query" and "request"`)
            }
        }

        const serverHandler = (req, res, next) => {
            // Cross-origin resource sharing
            handleCORS(req, res);

            let statusCode = 200;
            let errorMessage = "success";
            let mockResponse;

            let reqPath = req.getPath();
            let reqMethod = req.method;
            // json object, maybe return {}
            let reqQuery = req.query;
            // maybe return {} or "" or undefined
            let reqBody = req.body;
            let reqHeaders = req.headers;
            let rs = new RequestStruct(reqPath, reqMethod, reqHeaders, reqQuery, reqBody);

            if (bodyVerbose) {
                if (req.rawBody !== undefined) {
                    req.verbose.requestBody = stringify(req.rawBody);
                } else {
                    req.verbose.requestBody = stringify(req.body);
                }
            }

            let length = routedInterceptors.length;
            for (let i = 0; i < length; i++) {
                const interceptor = routedInterceptors[i];
                let result = interceptor(rs, new ResponseAction(res));
                if (!result) continue;
                let {code, message, data} = result;
                if (code) {
                    mockResponse = bodyFormatter(code, message, rs, data);
                    if (bodyVerbose) {
                        req.verbose.responseBody = stringify(mockResponse);
                    }
                    res.send(code, mockResponse);
                    return next();
                }
            }

            block: {
                if (params) {
                    let reqParams;
                    if (!isEmptyOrFalse(reqQuery)) {
                        reqParams = reqQuery;
                    } else {
                        if (typeof reqBody === 'string') {
                            try {
                                reqParams = JSON.parse(reqBody)
                            } catch (e) {
                                console.error(e);
                                console.error(reqBody);
                                statusCode = 400;
                                errorMessage = `${req.getContentType()} isn't match request body ${omitString(reqBody)}`;
                                break block;
                            }
                        } else {
                            reqParams = reqBody;
                        }
                    }

                    let {matched, message} = compare(params, reqParams, 'params');
                    if (!matched) {
                        statusCode = 400;
                        errorMessage = message;
                        break block;
                    }
                } else if (query) {
                    if (isEmptyOrFalse(reqQuery)) {
                        statusCode = 400;
                        errorMessage = "Require a query to send in the request";
                        break block;
                    }
                    let {matched, message} = compare(query, reqQuery, 'query');
                    if (!matched) {
                        statusCode = 400;
                        errorMessage = message;
                        break block;
                    }
                } else if (request) {
                    if (!isEmptyOrFalse(reqBody)) {
                        statusCode = 400;
                        errorMessage = "Require a body to send in the request";
                        break block;
                    }
                    let {matched, message} = compare(request, reqBody, 'body');
                    if (!matched) {
                        statusCode = 400;
                        errorMessage = message;
                        break block;
                    }
                }
            }


            if (statusCode >= 200 && statusCode < 300) {
                mockResponse = randomClone(response);
            }
            mockResponse = bodyFormatter(statusCode, errorMessage, rs, mockResponse);
            res.send(statusCode, mockResponse);
            if (bodyVerbose) {
                req.verbose.responseBody = stringify(mockResponse);
            }
            return next();
        };
        console.log(`Handling route ${method.toUpperCase()} ${path}`);
        handle(path, serverHandler);
        server.opts(path, (req, res, next) => {
            handleCORS(req, res);
            res.send(200);
            return next();
        });
    };
    routes.forEach(handleRoute);
    server.listen(port, function () {
        console.log(`Server ${server.name} listening at ${server.url}`);
    });
};

MockServer.prototype.loadAndServe = function (jsonPath, port) {
    let routes = fs.readFileSync(jsonPath).toString();
    routes = JSON.parse(routes);
    this.serve(routes, port);
};

MockServer.prototype.addHttpBasicInterceptor = function (username, password, filter) {
    this.addRoutedInterceptor(createHttpBasicInterceptor(username, password, filter));
};

MockServer.prototype.addAuthorizationInterceptor = function (name, createToken, filter) {
    this.addRoutedInterceptor(createAuthorizationInterceptor(name, createToken, filter));
};

MockServer.prototype.addRoutedInterceptor = function (interceptor) {
    if (this.routedInterceptors.indexOf(interceptor) !== -1) {
        console.warn("You added a interceptor which already exists, so I will ignore it")
    }
    this.routedInterceptors.push(interceptor);
};

module.exports = {
    MockServer,
    LoggingLevel,
    RequestStruct,
    ResponseAction,
    defaultBodyFormatter,
};
