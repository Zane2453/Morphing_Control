exports.https = false;
if(exports.https){
    exports.httpServerOptions = {
        key:require("fs").readFileSync("/etc/letsencrypt/live/votedev.iottalk.tw/privkey.pem"),
        cert:require("fs").readFileSync("/etc/letsencrypt/live/votedev.iottalk.tw/fullchain.pem"),
    };
}
exports.httpsPort = 443;
exports.httpPort = 80;
exports.IoTtalkURL = "http://140.113.215.20:7788/csm";