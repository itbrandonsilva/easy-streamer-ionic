"use strict";

var child_process = require('child_process');
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

var express = require("express");
var bodyParser = require("body-parser");
var swig = require("swig");
var psTree = require('ps-tree');
var async = require('async');

var PORT = 3000;
var CMD = "/usr/local/bin/livestreamer";
var CONFIG = require("./config.json");

var quality = "best";

var app = express();
app.set('view cache', false);
swig.setDefaults({cache: false});

var server = require('http').Server(app);
var socketio = require('socket.io')(server);

app.use(bodyParser.json());

app.get("/components/app.js", function (req, res) {
    res.append('content-type', 'text/javascript');
    res.send(swig.renderFile("./public/components/app.js", {client_id: CONFIG.client_id}));
});

app.get("/stream/settings", function (req, res) {
    res.json({quality: quality});
});

app.put("/stream/stop", function (req, res) {
    res.send('shutdown');
    killPs(function (err) {
        if (err) return console.error;
    });
});

app.put("/stream/play/:name", function (req, res) {
    var channelName = req.params['name'];
    watchChannel(channelName, function (err) { if (err) console.error(err); });
});

app.put("/stream/settings/set/quality/:quality", function (req, res) {
    quality = req.params['quality'];
    res.send("ok");
});

app.put("/stream/restart", function (req, res) {

});

app.use(express.static('public'));

server.listen(PORT, function () {
    log('');
    log(new Date());
    log('Listening on port ' + PORT)
})

function log(data) {
    console.log(data);
    socketio.emit('log', data);
}

var ps = null;
function killPs(cb) {
    if ( !ps ) return cb();
    psTree(ps.pid, function (err, children) {
        if (err) return cb(err);
        spawnSync('kill', ['-9'].concat(children.map(function (p) {return p.PID})));
        log('Killed.');
        return cb();
    });
}

function watchChannel(channelName, cb) {
     log("watchChannel()");
     async.series([killPs],
        function (err) {
            if (err) return cb(err);

            var cmdString = 'livestreamer twitch.tv/' + channelName + ' ' + quality + ' -np "omxplayer -o hdmi"'

            log("Executing: " + cmdString);
            ps = spawn('/bin/sh', ['-c', cmdString]);

            ps.stdout.on('data', function (data) {
                data = data.slice(0, data.length-1);
                log("PSOUT: " + data.toString());
            }); 
            ps.stderr.on('data', function (data) {
                data = data.slice(0, data.length-1);
                log("PSERR: " + data.toString());
            }); 
            ps.on('exit', function (code, signal) {
                log('PS EXIT: ' + signal + '/' + signal);
            }); 
            ps.on('close', function (code, signal) {
                log('PS CLOSE: ' + signal + '/' + signal);
            }); 

            return cb();
        }   
    );  
}
