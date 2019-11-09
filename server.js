var express = require('express'),
    app = express(),
    config = require('./config'),
    redirectApp = express(),
    server =  (config.https) ?
        require('https').createServer(config.httpServerOptions, app) :
        require('http').createServer(app),
    httpRedirectServer = (config.https) ?
        require('http').createServer(redirectApp) : null,
    socketIo = require('socket.io')(server),
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

if(config.https) {
    server.listen(config.httpsPort, '0.0.0.0');
    httpRedirectServer.listen(config.httpPort, '0.0.0.0');
    redirectApp.get('*', function(req, res) {
        res.redirect('https://' + req.headers.host + req.url);
    });
}
else
    server.listen(config.httpPort, '0.0.0.0');

/*** socket.io ***/
socketIo.on('connection', function(socket){
    socket.on("Acceleration", function(msg){
        dan2.push('Acceleration', msg);
        //console.log(msg);
    });
    socket.on("poll", function(df, msg){
        dan2.push(df+'-I', [msg]);
    });
});

/*--------------------------------------------------------------------------------*/
/* IoTtalk Setting */
let IDFList = [
        ['Acceleration', ['g', 'g', 'g']],
        ['Amplitude-I', ['g']],
        ['Shape-I', ['g']],
        ['Vibration-I', ['g']],
        ['Rotation-I', ['g']],
    ],
    ODFList = [
        ['Display', ['g']]
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
    'odf_list': ODFList,
    'profile': {
        'model': 'Processing_Control',
    },
    'accept_protos': ['mqtt'],
}, init_callback);