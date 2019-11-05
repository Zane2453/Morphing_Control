var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    socketIo = require('socket.io')(server),
    config = require('./config'),
    fs = require('fs'),
    dan2 = require('./iottalk/dan2').dan2(),
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

server.listen((process.env.PORT || config.port), '0.0.0.0');

/*** socket.io ***/
socketIo.on('connection', function(socket){
    socket.on("Acceleration", function(msg){
        dan2.push('Acceleration', msg);
        //console.log(msg);
    });
});

/*--------------------------------------------------------------------------------*/
/* IoTtalk Setting */
let IDFList = [
        ['Acceleration', ['g', 'g', 'g']]
    ];
    
function on_signal(cmd, param){
    console.log('[cmd]', cmd, param);
    return true;
}

function on_data(odf_name, data){
    console.log('[data]', odf_name, data);
}

function init_callback(result) {
    console.log('[da] register:', result);
}

dan2.register(config.IoTtalkURL, {
    'name': "1.Smartphone",
    'on_signal': on_signal,
    'on_data': on_data,
    'idf_list': IDFList,
    'profile': {
        'model': 'Smartphone',
    },
    'accept_protos': ['mqtt'],
}, init_callback);