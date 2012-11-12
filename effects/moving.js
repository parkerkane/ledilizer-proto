var _ = require('underscore');
var async = require('async');

var color = require('../color');
var remote = require('../remote');
var manager = require('../manager');
var base = require('../base');
var web = require('../web');

function sine(val, size) {
    return 1 - ((Math.cos(val * Math.PI * 2 / size) + 1) / 2)
}

function saw(val, size) {
    return 1 - ((val % size) / size);
}

var SineDim = base.Effect.extend({

    initialize: function () {
        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;

        remote.on('osc:/2/fader3', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle3', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader2', _.bind(this.onSpeed, this));

        web.on('color:sinecolor', _.bind(this.setColor, this));

        this.color = {r: .1, g: 0, b: 1}

        this.time = 0;
        this.lastTime = Date.now();
        this.speed = 100;
    },

    render: function () {
        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        var value = this.value;
        var idx = 0;

        var time = Date.now();
        this.time -= (time - this.lastTime) / (1000 / this.speed);
        this.lastTime = time;

        _.each(fixs, function (fix) {

            var orderedIdx = (Math.floor(fixs.length / 2) * (idx & 0x1)) + (idx >> 1);

            var len = fix.length;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var s = sine(i * 16 + orderedIdx * 16 + that.time, 256);

                ins.set('intensity', s, value);
                ins.set('red', that.color.r * s, value);
                ins.set('green', that.color.g * s, value);
                ins.set('blue', that.color.b * s, value);

            }

            idx++;
        });

    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    setColor: function (color) {
        this.color = color;
    },

    onSpeed: function (value) {
        this.speed = 1 + 999 * value;
    }
});

manager.effects.add(new SineDim);

var SawDim = base.Effect.extend({

    initialize: function () {
        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;

        remote.on('osc:/2/fader4', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle4', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader2', _.bind(this.onSpeed, this));

        web.on('color:sawcolor', _.bind(this.setColor, this));

        this.color = {r: .1, g: 0, b: 1}

        this.time = 0;
        this.lastTime = Date.now();
        this.speed = 100;
    },

    render: function () {
        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        var value = this.value;
        var idx = 0;

        var time = Date.now();
        this.time += (time - this.lastTime) / (1000 / this.speed);
        this.lastTime = time;

        _.each(fixs, function (fix) {

            var orderedIdx = (Math.floor(fixs.length / 2) * (idx & 0x1)) + (idx >> 1);

            var len = fix.length;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var s = saw(i * 16 + orderedIdx * 16 + that.time, 256);
                ins.set('intensity', s, value);
                ins.set('red', that.color.r * s, value);
                ins.set('green', that.color.g * s, value);
                ins.set('blue', that.color.b * s, value);

            }

            idx++;
        });

    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    setColor: function (color) {
        this.color = color;
    },

    onSpeed: function (value) {
        this.speed = 1 + 999 * value;
    }
});

manager.effects.add(new SawDim);

var Chase3 = base.Effect.extend({
    initialize: function () {
        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;
        this.speed = 10;

        remote.on('osc:/2/fader5', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle5', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader3', _.bind(this.onSpeed, this));

        web.on('color:3rdcolor', _.bind(this.setColor, this));

        this.time = 0;
        this.lastTime = Date.now();

        this.color = {r: .5, g: 0, b: 1}
    },

    render: function () {
        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;
        var idx = 0;

        var time = Date.now();
        this.time += (time - this.lastTime) / (1000 / that.speed);
        this.lastTime = time;

        _.each(fixs, function (fix) {

            var len = fix.length;
            var orderedIdx = (Math.floor(fixs.length / 4) * (idx & 0x3)) + (idx >> 2);
//            var orderedIdx = idx;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var chIdx = Math.floor(i / (len / 9));
                var chase = Math.floor(orderedIdx + that.time) % 18;

                var c = chIdx == chase ? 1 : 0;

                ins.set('intensity', c, that.value);
                ins.set('red', that.color.r * c, that.value);
                ins.set('green', that.color.g * c, that.value);
                ins.set('blue', that.color.b * c, that.value);
            }

            idx++;
        });

    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    setColor: function (color) {
        this.color = color;
    },

    onSpeed: function (value) {
        this.speed = 1 + 39 * value;
    }


});

manager.effects.add(new Chase3);

var ChaseFull = base.Effect.extend({
    initialize: function () {
        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;
        this.speed = 10;

        remote.on('osc:/2/fader2', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle2', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader3', _.bind(this.onSpeed, this));

        web.on('color:3rdcolor', _.bind(this.setColor, this));

        this.time = 0;
        this.lastTime = Date.now();

        this.color = {r: .5, g: 0, b: 1}
    },

    render: function () {
        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(10);
        var that = this;
        var idx = 0;

        var time = Date.now();
        this.time += (time - this.lastTime) / (1000 / that.speed);
        this.lastTime = time;

        _.each(fixs, function (fix) {

            var len = fix.length;
//            var orderedIdx = (Math.floor(fixs.length / 4) * (idx & 0x3)) + (idx >> 2);
            var orderedIdx = idx;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var chIdx = Math.floor(i / (len / 1));
                var chase = Math.floor(orderedIdx + that.time) % 9;

                var c = chIdx == chase ? 1 : 0;

                ins.set('intensity', c, that.value);
                ins.set('red', that.color.r * c, that.value);
                ins.set('green', that.color.g * c, that.value);
                ins.set('blue', that.color.b * c, that.value);
            }

            idx++;
        });

    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    setColor: function (color) {
        this.color = color;
    },

    onSpeed: function (value) {
        this.speed = 1 + 39 * value;
    }


});

manager.effects.add(new ChaseFull);