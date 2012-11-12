var _ = require('underscore');

var color = require('../color');
var remote = require('../remote');
var manager = require('../manager');
var base = require('../base');
var prng = require('../prng');

//var RandomWhite = base.Effect.extend({
//    initialize: function () {
//        console.log('static init');
//
//        this.on('render', _.bind(this.render, this));
//
//        this.value = 0;
//        this.enabled = false;
//        this.speed = 10;
//
//        remote.on('osc:/2/fader6', _.bind(this.onFader, this));
//        remote.on('osc:/2/toggle6', _.bind(this.onToggle, this));
//
//        remote.on('osc:/1/fader3', _.bind(this.onSpeed, this));
//
//        this.time = 0;
//        this.lastTime = Date.now();
//
//    },
//
//    render: function () {
//
//        if (!this.enabled) {
//            return;
//        }
//
//        var fixs = manager.fixtures.getByGid(0);
//        var that = this;
//
//        var value = this.value;
//
//        var time = Date.now();
//        this.time += (time - this.lastTime) / (1000 / this.speed);
//        this.lastTime = time;
//
//        prng.seed(this.time);
//
//        _.each(fixs, function (fix) {
//
//            var len = fix.length;
//
//            var bit = prng.getBit();
//
//            for (var i = 0; i < len; i++) {
//                var ins = fix.get(i);
//
//                if (i % 3 == 0) {
//                    bit = prng.getBit();
//                }
//
//
//                ins.set('intensity', bit, that.value);
//                ins.set('red', bit, that.value);
//                ins.set('green', bit, that.value);
//                ins.set('blue', bit, that.value);
//            }
//
//        });
//    },
//
//    onFader: function (value) {
//        this.value = value;
//    },
//
//    onToggle: function (value) {
//        this.enabled = !!value;
//    },
//
//    onSpeed: function (value) {
//        this.speed = 1 + 39 * value;
//    }
//});

//manager.effects.add(new RandomWhite);

var RandomWhiteFull = base.Effect.extend({
    initialize: function () {
        console.log('static init');

        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;
        this.speed = 10;

        remote.on('osc:/2/fader7', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle7', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader3', _.bind(this.onSpeed, this));

        this.time = 0;
        this.lastTime = Date.now();
    },

    render: function () {

        if (!this.enabled) {
            return;
        }

        console.log('render');

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        var value = this.value;

        var time = Date.now();
        this.time += (time - this.lastTime) / (1000 / this.speed);
        this.lastTime = time;

        console.log(this.time);

        prng.seed(Math.floor(this.time));
//        var bit = this.time & 0x1;

        _.each(fixs, function (fix) {

            var bit = prng.getBit();

            fix.set('intensity', bit, that.value);

            fix.set('red', bit, that.value);
            fix.set('green', bit, that.value);
            fix.set('blue', bit, that.value);
        });
    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        console.log('onToggle');
        this.enabled = !!value;
    },

    onSpeed: function (value) {
        this.speed = 1 + 39 * value;
    }
});

manager.effects.add(new RandomWhiteFull);

var StrobeAll = base.Effect.extend({
    initialize: function () {
        console.log('static init');

        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;
        this.speed = 20;

        remote.on('osc:/2/fader6', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle6', _.bind(this.onToggle, this));

//        remote.on('osc:/1/fader3', _.bind(this.onSpeed, this));

        this.time = 0;
        this.lastTime = Date.now();
    },

    render: function () {

        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        var value = this.value;

        var time = Date.now();
        this.time += (time - this.lastTime) / (1000 / this.speed);
        this.lastTime = time;
//
//        prng.seed(Math.floor(this.time));

        _.each(fixs, function (fix) {

            var len = fix.length;

            var bit = that.time & 1;

            fix.set('intensity', bit, that.value);

            fix.set('red', bit, that.value);
            fix.set('green', bit, that.value);
            fix.set('blue', bit, that.value);
        });
    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    onSpeed: function (value) {
        this.speed = 1 + 39 * value;
    }
});

manager.effects.add(new StrobeAll);
