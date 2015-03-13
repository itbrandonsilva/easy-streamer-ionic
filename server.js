"use strict";

var express = require("express")
var app = express()
var spawn = require("child_process").spawn;
var bodyParser = require("body-parser");
var swig = require("swig");

var PORT = 3000;
var cmd = "/usr/local/bin/livestreamer";
var config = require("./config.json");

// Not currently needed.
app.use(bodyParser.json());

var ps = null;

app.get("/components/app.js", function (req, res) {
    res.append('content-type', 'text/javascript');
    res.send(swig.renderFile("./public/components/app.js", {client_id: config.client_id}));
});

app.get("/stream/set/:name", function (req, res) {
    var channelName = req.params['name'];
    res.send(channelName);

    if (ps) { ps.kill("SIGINT"); console.log("Killed player..."); }
    console.log("Spawning player...");
    var url = "twitch.tv/" + channelName;
    ps = spawn(cmd, [url, "best", "-np", "\"omxplayer -o hdmi\""]);
    //ps = spawn(cmd, [url, "best", "--player", "vlc"]);
    ps.on("error", function (err) {
        console.log(err.message);
    });
});

app.use(express.static('public'));

var server = app.listen(PORT, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port)
})
