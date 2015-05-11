"use strict";

var child_process = require('child_process');
var spawn = child_process.spawn;
var spawnSync = child_process.spawnSync;

var express = require("express")
var bodyParser = require("body-parser");
var swig = require("swig");
var psTree = require('ps-tree');
var async = require('async');

var PORT = 3000;
var CMD = "/usr/local/bin/livestreamer";
var CONFIG = require("./config.json");

var quality = "best";

var app = express()
app.use(bodyParser.json());

var ps = null;
function killPs(cb) {
    if ( !ps ) return cb();
    psTree(ps.pid, function (err, children) {
        if (err) return cb(err);
        spawnSync('kill', ['-9'].concat(children.map(function (p) {return p.PID})));
        console.log('Killed.');
        return cb();
    });
}

app.get("/components/app.js", function (req, res) {
    res.append('content-type', 'text/javascript');
    res.send(swig.renderFile("./public/components/app.js", {client_id: CONFIG.client_id}));
});

app.put("/stream/stop", function (req, res) {
    res.send('shutdown');
    killPs(function (err) {
        if (err) return console.error;
    });
});

app.put("/stream/play/:name", function (req, res) {
    var channelName = req.params['name'];
    res.send(channelName);

    console.log('-----------');
    async.series([killPs],
        function (err) {
            if (err) return console.log(err);
            console.log("Spawning player...");
            var url = "twitch.tv/" + channelName;
            ps = spawn(CMD, [url, quality, "-np", "omxplayer -o hdmi"]);
            //ps = spawn(CMD, [url, "best", "--player", "vlc"]);
            ps.on("error", function (err) {
                console.log("Error: ", err.message);
            });
        }
    );
});

app.put("/stream/quality/:quality", function (req, res) {
    quality = req.params['quality'];
});

app.put("/stream/restart", function (req, res) {

});

app.use(express.static('public'));

var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port)
})
