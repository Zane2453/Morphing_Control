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
let Amplitude = 0.1,
    Vibration = 0.005,
    Rotation = 0.001,
    Shape = 9;

let Red = 217,
    Green = 143,
    Blue = 221;

// var connections = [],
//     users = [];

socketIo.on('connection', function(socket){
    // connections.push(socket);
    // console.log('Connected: %s sockets connected', connections.length);

    // socket.on("Acceleration", function(msg){
    //     dan2.push('Acceleration', msg);
    // });
    // socket.on("poll", function(df, msg){
    //     dan2.push(df+'-I', [msg]);
    // });
    socket.on("Amplitude", function(msg){
        if(msg !== undefined){
            Amplitude = msg;
            dan2.push('Amplitude-I', [Amplitude]);
        }
        socket.emit("Amplitude", Amplitude);
    });
    socket.on("Vibration", function(msg){
        if(msg !== undefined){
            Vibration = msg;
            dan2.push('Vibration-I', [Vibration]);
        }
        socket.emit("Vibration", Vibration);
    });
    socket.on("Rotation", function(msg){
        if(msg !== undefined){
            Rotation = msg;
            dan2.push('Rotation-I', [Rotation]);
        }
        socket.emit("Rotation", Rotation);
    });
    socket.on("Shape", function(msg){
        if(msg !== undefined){
            Shape = msg;
            dan2.push('Shape-I', [Shape]);
        }
        socket.emit("Shape", Shape);
    });
    socket.on("Color", function(msg){
        dan2.push('Color-I', msg);
    });

    // socket.on('disconnect', function(data){
    //     users.splice(users.indexOf(socket.username), 1);
    //     connections.splice(connections.indexOf(socket), 1);
    //     console.log('Disconnected: %s sockets connected', connections.length);
    // });
});

/*--------------------------------------------------------------------------------*/
/* IoTtalk Setting */
let IDFList = [
        //['Acceleration', ['g', 'g', 'g']],
        ['Amplitude-I', ['g']],
        ['Shape-I', ['g']],
        ['Vibration-I', ['g']],
        ['Rotation-I', ['g']],
        ['Color-I', ['g']]
    // ],
    // ODFList = [
    //     ['Display', ['g']]
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
    //'odf_list': ODFList,
    'profile': {
        'model': 'Morphing_Control',
    },
    'accept_protos': ['mqtt'],
}, init_callback);