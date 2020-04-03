const {stringify, queryStringToObject} = require('./util/strings');

const LoggingLevel = {
    NONE: 0,
    HEADERS: 1,
    BODY: 2,
};

// the third argument of #bodyFormatter
class RequestStruct {
    constructor(path, method, headers, query, body, statement){
        this.path = path;
        this.method = method;
        this.headers = headers;
        this.body = body;

        if (typeof query === 'object'){
            this.query = query;
            this.statement = statement;
            return;
        }

        if (statement){
            this.statement = statement;
            this.query = queryStringToObject(stringify(query));
        } else {
            let qs = queryStringToObject(stringify(query), true);
            this.query = qs.query;
            this.statement = qs.statement;
        }
    }
}

// the first argument of #interceptor
// modify prototype to empower it by yourself
class ResponseAction {
    /**
     * create a wrapper of restify response
     * @param res restify response
     */
    constructor(res) {
        this.res = res;
    }

    header(name, value){
        this.res.header(name, value);
    }
}

/**
 * default response body formatter
 * @param statusCode http status code
 * @param message error message
 * @param requestStruct wrapped request information
 * @param data the entity wrapped in response body
 * @returns response body
 */
function defaultBodyFormatter(statusCode, message, requestStruct, data) {
    if (statusCode >= 200 && statusCode < 300) {
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
}

function createHttpBasicInterceptor(username, password, filter) {
    return createAuthorizationInterceptor('Basic', rs => {
        return Buffer.from(`${username}:${password}`).toString('base64');
    }, filter);
}

function createAuthorizationInterceptor(name, createToken, filter) {
    if (!filter){
        // default no filter
        filter = requestStruct  => false;
    }
    // return a interceptor
    return function (requestStruct, responseAction) {
        // filter some request
        if (filter(requestStruct)) return;

        let token = createToken(requestStruct);
        let authorization = requestStruct.headers['authorization'];
        if (authorization === `${name} ${token}`) return;
        responseAction.header('WWW-Authenticate', `${name} realm="Restricted"`);
        return {
            code: 401,
            message: `HTTP ${name} Authorization Required`,
            data: undefined,
        };
    }
}

/// Exports

module.exports = {
    LoggingLevel,
    RequestStruct,
    ResponseAction,
    defaultBodyFormatter,
    createHttpBasicInterceptor,
    createAuthorizationInterceptor,
};
