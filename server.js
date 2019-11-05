var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    socketIo = require('socket.io')(server),
    config = require('./config'),
    fs = require('fs'),
    expressSession = require('express-session'),
    IndexPagePath = __dirname + "/web/html/index.html",
    IndexPage = fs.readFileSync(IndexPagePath, 'utf8');

// initialize app
app.use(express.static('./web'));
app.use(expressSession({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

app.get('/', function(req, res){
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(IndexPage);
});

/*** socket.io ***/
socketIo.on('connection', function(socket){
    socket.on("Acceleration", function(msg){
        console.log(msg);
    });
});

server.listen((process.env.PORT || config.port), '0.0.0.0');