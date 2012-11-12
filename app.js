require('./underfixes.js');
require('better-require')('yaml');

require('./fixtures');
require('./effects');
require('./web.js');

var _ = require('underscore');

var dmx = require('./dmx.js');
var remote = require('./remote.js');
var manager = require('./manager.js');

remote.on('osc', function (target, parameters) {
    console.log('osc', target, parameters);
});

remote.on('osc:/ping', function () {
    console.log('OSC Ping!');

    remote.sendOldDataBack();
});

var config = require('./show.yaml');

_.each(config.patch, function (data) {

    var universe = data.universe;

    _.each(data.fixtures, function (fixtures, fixtureName) {
        _.each(fixtures, function (fixtureData) {
            var fix = manager.fixtures.add(fixtureName, universe, fixtureData);
        });

    })

});

setInterval(function () {
    var s = Date.now();

    manager.fixtures.reset();
    manager.effects.render();
    manager.fixtures.render();

    dmx.sendDMX();
    var e = Date.now();

//    console.log(e - s);

}, 1000 / 40);
