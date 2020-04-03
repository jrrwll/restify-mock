# restify-mock
A mock server for Restful API powered by restify
(add OPTIONS method to all routes automatically to support Cross-origin resource sharing)
### Get start
```sh
cd /path/to/project
npm init -y
npm i restify-mock
```
### Usage
- *serve*
```js
const {MockServer} = require('restify-mock');
// or verbose mode, pass true to the first argument
const server = new MockServer();

// #loadAndServe(), load a json file
server.loadAndServe('/path/to/routes.json');
// or #serve(), load from js object
server.serve(routes);
```
- *config*
```js
const {MockServer, LoggingLevel} = require('restify-mock');
// not change #loggingLevel or #bodyFormatter after invoking the constructor
const server = new MockServer(LoggingLevel.HEADERS,
        (statusCode, message, requestStruct, data) => {
    if (statusCode >= 200 && statusCode < 300){
        return {
            success: true,
            message: message,
            data: data,
        };
    } else {
        return {
            success: false,
            message: message,
        };
    }
});   
server.baseUrl = '/api/v1';
// just a example, use addHttpBasicInterceptor(username, password) instead of
server.addRoutedInterceptor((requestStruct, responseAction) => {
    let token = Buffer.from(`Basic ${username}:${password}`).toString('base64');
    let authorization = requestStruct.headers['authorization'];
    if (!authorization) authorization = requestStruct.headers['Authorization'];
    let authorized = authorization === token;
    if (authorized) return;
    responseAction.header('WWW-Authenticate', 'Basic realm="Restricted"');
    return {
        code: 401,
        message: "HTTP Basic Authorization Required",
        data: undefined,
    };
});
```
**routes.json**
```json
[
  {
    "path": "/mock",
    "method": "put",
    "params": {
      "s1": "params, query or request",
      "n1": 0,
      "b1": false
    },
    "response": {
      "ps1": "[0-9]{4}-[0-9]{2}-[0-9]{2}",
      "pn1": "0; field type is number"
    }
  },
  {
    "path": "/",
    "method": "post",
    "query": {
      "s1": "",
      "n1": 0,
      "b1": false
    },
    "request": {
      "qs1": "",
      "qn1": "0;number type"
    },
    "response": {
      "ps1": "cat|dog",
      "pn1": "0;this is a description",
      "po1": {
        "po1s1": "mock server",
        "po1n1": "1;node",
        "po1n2": -1
      },
      "pa1": [
        {
          "pa11o1": {},
          "pa11n1": 2,
          "pa11n2": "2",
          "pa11b1": false
        },
        {
          "pa12n1": 1024
        },
        "1024;"
      ]
    }
  }
]
```

### Demo
```js
const {MockServer, LoggingLevel, defaultBodyFormatter} = require('restify-mock');
const server = new MockServer(LoggingLevel.BODY);
server.baseUrl = '/api/v1';
server.bodyFormatter = (code, message, rs, data) => {
    let path = rs.path;
    if (code === 200 && /\/login$/.test(path)){
        return {
            success: true,
            message: "success",
            token: "auth token",
            data: data,
        }
    }
    return defaultBodyFormatter(code, message, rs, data);
};
server.loadAndServe(`routes.json`, 1024);
```
