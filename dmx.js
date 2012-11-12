var _ = require('underscore');
var dgram = require('dgram');

var Buffer = require('buffer').Buffer;

var web = require('./web.js');

var buffers = exports.buffer = [];

for (var i = 0; i < 8; i++) {
    var buf = buffers[i] = new Buffer(1024);

    buf.fill(0, 0, 1024);

    var size = 512;

    buf.write('ESDD');
    buf[4] = i; // universe
    buf[5] = 0; // startcode
    buf[6] = 1; // datatype

    buf[7] = size >> 8;
    buf[8] = size & 0xFF;

}

var client = dgram.createSocket('udp4');
client.bind();
client.setBroadcast(true);
client.setMulticastTTL(128);

exports.setDMX = function (universe, channel, data) {
    channel = Math.max(0, Math.min(512, channel));
    data = Math.floor(data);
    buffers[universe][9 + channel] = data;

    web.setDMX(universe, channel, data);
};

exports.getDMX = function (universe, channel) {
    channel = Math.max(0, Math.min(512, channel));
    return buffers[universe][9 + channel];
};

exports.sendDMX = function () {

    _.each(buffers, function (buf) {
        client.send(buf, 0, 512 + 10, 3333, '2.0.0.255');

    });
};
