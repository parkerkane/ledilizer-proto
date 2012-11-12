var Buffer = require('buffer').Buffer;
var dgram = require('dgram');

var _ = require('underscore');
var Backbone = require('backbone');

var server = dgram.createSocket('udp4');

_.extend(exports, Backbone.Events);

function findZero(buf) {

    for (var i = 0; i < buf.length; i++) {
        if (buf[i] === 0) {
            return i;
        }
    }

    return buf.length;
}

function parseParameters(template, buf) {
    var params = [];
    var pos = 0;

    for (var i = 1; i < template.length; i++) {
        var ch = template.charAt(i);

        switch (ch) {
            case 'f':
                params.push(buf.readFloatBE(pos));
                pos += 4;
                break;
        }
    }

    return params;
}

var oldData = {};
var lastAddress = null;

exports.aliases = {};

server.on('message', function (msg, rinfo) {
    var pos;

    pos = findZero(msg);

    var target = msg.toString('ascii', 0, pos);

    oldData[target] = new Buffer(msg.length);
    msg.copy(oldData[target]);

    lastAddress = rinfo;

    msg = msg.slice(pos + 4 - pos % 4);

    pos = findZero(msg);

    var template = msg.toString('ascii', 0, pos);

    msg = msg.slice(pos + 4 - pos % 4);

    var parameters = parseParameters(template, msg);

    exports.trigger('osc', target, parameters);
    exports.trigger.apply(exports, ['osc:' + target].concat(parameters));

    var alias = exports.aliases[target];

    if (!_.isUndefined(alias)) {
        exports.trigger('osc', alias, parameters);
        exports.trigger.apply(exports, ['osc:' + alias].concat(parameters));
    }
});

server.on('listening', function () {

    var address = server.address();

    console.log("osc server listening @", address.port);

});

server.bind(8000);

var ignore = ['/1', '/2', '/3', '/4'];

exports.sendOldDataBack = function () {
    _.each(oldData, function (val, key) {

        if (_.contains(ignore, key)) {
            return;
        }

        server.send(val, 0, val.length, 9000, lastAddress.address);
    })
};