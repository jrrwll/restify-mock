'use strict';

function getHandler(server, method) {
    let handle;
    switch (method) {
        case "get":
            handle = server.get.bind(server);
            break;
        case "post":
            handle = server.post.bind(server);
            break;
        case "put":
            handle = server.put.bind(server);
            break;
        case "del":
        case "delete":
            handle = server.del.bind(server);
            break;
        case "patch":
            handle = server.patch.bind(server);
            break;
        case "head":
            handle = server.head.bind(server);
            break;
        case "options":
            handle = server.opts.bind(server);
            break;
        default:
            throw new Error(`Http method ${method} doesn't exist`)
    }
    return handle;
}


module.exports = {
    getHandler,
};
