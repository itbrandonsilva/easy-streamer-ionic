"use strict";

var express = require("express")
var app = express()
var spawn = require("child_process").spawn;
var bodyParser = require("body-parser");

var PORT = 3000;
var cmd = "/usr/local/bin/livestreamer";

app.use(bodyParser.json());

var ps = null;

app.get("/", function (req, res) {
    return res.send("Invalid request.");
});

app.post("/", function (req, res) {
    var url = req.body.url;
    if ( ! url ) return res.send("Please provide a 'url' key in the post body.");

    if (ps) { ps.kill("SIGINT"); console.log("Killed player..."); }
    console.log("Spawning player...");
    ps = spawn(cmd, [url, "best", "--player", "vlc"]);
    ps.on("error", function (err) {
        console.log(err.message);
    });
    res.send(url);
})


var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log('Example app listening at http://%s:%s', host, port)
})
