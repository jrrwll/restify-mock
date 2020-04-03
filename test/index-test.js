'use strict';

const {describe, it} = require("mocha");
const clients = require('restify-clients');
const {MockServer, LoggingLevel} = require('../lib');

const routes = [
    {
        path: "/mock", method: "put",
        params: {
            s1: "params, query or request",
            n1: 0,
            b1: false
        },
        response: {
            ps1: "this is a description",
            pn1: "0; field type is number"
        }
    },
    {
        path: "/", method: "post",
        // params, query or request
        query: {
            s1: "",
            n1: 0,
            b1: false,
        },
        request: {
            qs1: "",
            qn1: "0;number type",
        },
        response: {
            ps1: "response string",
            pn1: "0;this is a description",
            po1: {
                po1s1: "mock server",
                po1n1: "1;node",
                po1n2: -1,
            },
            pa1: [{
                pa11o1: {},
                pa11n1: 2,
                pa11n2: "2",
                pa11b1: false,
            }, {pa12n1: 1024}, "1024;"],
        }
    },
];

describe('MockServer', function () {
    it('mock server debug', function () {
        const server = new MockServer(LoggingLevel.BODY);
        const port = 4096;
        server.serve(routes, port);
        let client = clients.createJsonClient({
            url: `http://localhost:${port}`,
            version: '~1.0',
        });
        client.opts('/?a=b&c=1&d=false', function (err, req, res, data) {
            console.log('[1] %d Received: %j', res.statusCode, data);
        });

        client.patch('/patch', function (err, req, res, data) {
            console.log('[2] %d Received: %j', res.statusCode, data);
        });

        let body = '{"qs1": "what", "qn1": 909}';
        client.post('/?s1=who&n1=2&b1=1', body, function (err, req, res, data) {
            console.log('[3] %d Received: %j', res.statusCode, data);
        });
    });

    it('mock server from js', function () {
        const server = new MockServer(LoggingLevel.BODY);
        let username = "username";
        let password = "password";
        server.addHttpBasicInterceptor(username, password);
        const port = 8192;
        server.serve(routes, port);
        let client = clients.createJsonClient({
            url: `http://localhost:${port}`,
            version: '~1.0',
        });
        client.headers['Authorization'] = Buffer.from(`Basic ${username}:${password}`).toString('base64');

        let body = "qs1=what&qn1=909";
        client.post('/?s1=who&n1=2&b1=1', body, function (err, req, res, data) {
            console.log('[4] %d Received: %j', res.statusCode, data);
        });
        body = '{"qs1": "what", "qn1": 909}';
        client.post('/?s1=who&n1=2&b1=1', body, function (err, req, res, data) {
            console.log('[5] %d Received: %j', res.statusCode, data);
        });

        client.headers['Authorization'] = 'dXNl';
        client.post('/?s1=who&n1=2&b1=1', body, function (err, req, res, data) {
            console.log('[6] %d Received: %j', res.statusCode, data);
        });
    });

    it('mock server from json', function () {
        const server = new MockServer(LoggingLevel.BODY);
        const port = 10240;
        server.loadAndServe('./test/routes.json', port);
        let client = clients.createJsonClient({
            url: `http://localhost:${port}`,
            version: '~1.0'
        });
        let body = {
            qs1: "what",
            qn1: 909,
        };
        let seq = 1;
        client.post('/?s1=who&n1=2&b1=true', body, function (err, req, res, data) {
            console.log('[7] %d Received: %j', res.statusCode, data);
        });
        client.post('/?s1=who&n1=2&b1=1', body, function (err, req, res, data) {
            console.log('[8] %d Received: %j', res.statusCode, data);
        });
        client.put('/mock?s1=who&n1=2&b1=1', "", function (err, req, res, data) {
            console.log('[9] %d Received: %j', res.statusCode, data);
        });
        client.put('/mock?s1=who&n1=2&b1=1', "s1=who&n1=2&b1=1", function (err, req, res, data) {
            console.log('[10] %d Received: %j', res.statusCode, data);
        });
    });

    it('mock server submit a form', function () {
        const server = new MockServer(LoggingLevel.BODY);
        server.baseUrl = '/api/v1';
        const port = 2048;
        server.serve(routes, port);
        let stringClient = clients.createStringClient({
            url: `http://localhost:${port}`,
            version: '~1.0'
        });

        // application/x-www-form-urlencode
        stringClient.put('/api/v1/mock', "s1=who&n1=2&b1=1", function (err, req, res, data) {
            console.log('[11] %d Received: %s', res.statusCode, data);
        });

        let jsonClient = clients.createJsonClient({
            url: `http://localhost:${port}`,
            version: '~1.0'
        });
        jsonClient.put('/api/v1/mock', '{"s1": "what", "n1": 909, "b1": false}', function (err, req, res, data) {
            console.log('[12] %d Received: %j', res.statusCode, data);
        });
    });
});


