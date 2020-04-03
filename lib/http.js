
// Cross-origin resource sharing
function handleCORS(req, res) {
    let headers = req.headers;
    let origin = headers['origin'];
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', "true");
        res.header('Access-Control-Allow-Headers', headers['access-control-request-headers']);
    }
}

module.exports = {
    handleCORS,
};
