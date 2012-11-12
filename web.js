var _ = require('underscore');
var Backbone = require('backbone');
var WebSocketServer = require('websocket').server;
var express = require('express');
var http = require('http');

_.extend(exports, Backbone.Events);

var manager = require('./manager.js');

var dmxBuffers = new Array();

for (var i = 0; i < 8; i++) {
    dmxBuffers[i] = new Array(512);
    for (var j = 0; j < 512; j++) {
        dmxBuffers[i][j] = 0;
    }
}

exports.setDMX = function (universe, channel, data) {
    dmxBuffers[universe][channel] = data;
};

var app = express();
var httpServer = http.createServer(function () {

});

httpServer.listen(5000);

var wsServer = new WebSocketServer({
    httpServer: httpServer
});

var connections = [];

wsServer.on('request', function (request) {

    console.log('new request', request.origin);

    var connection = request.accept(null, request.origin);

    connections.push(connection);

    connection.on('message', function (message) {

        console.log('message', message);
//        console.log('data', JSON.parse(message.utf8Data));

        var data = JSON.parse(message.utf8Data);

        exports.trigger(data.type + ':' + data.id, data);

    });

    connection.on('close', function (conn) {

        connections = _.filter(connections, function (val) {
            return val != connection;
        });

        console.log('Disconnected! Connections left:', connections.length);

    });
});

setInterval(function () {

    var dmxJson = JSON.stringify({
        type:'dmx',
        content:dmxBuffers
    });

    var fixJson = JSON.stringify({

        type: 'fix',
        content: manager.fixtures.map(function (fix) {
            return fix.jsonData
        })

    });

    _.each(connections, function (conn) {

        conn.send(dmxJson);
        conn.send(fixJson);

    });




}, 1000/10);

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(require('less-middleware')({ src: __dirname + '/htdocs' }));
app.use(express.static(__dirname + '/htdocs'));

app.listen(4000);

console.log('http server listening @ 4000');