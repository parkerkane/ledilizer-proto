var _ = require('underscore');

var color = require('../color');
var remote = require('../remote');
var manager = require('../manager');
var base = require('../base');
var web = require('../web');

function dist(a, b, c, d) {
    return Math.sqrt(((a - c) * (a - c) + (b - d) * (b - d)));
}

function normalize1(x) {
    x = (x + 1) / 2;
    return x;
}

function normalize256(x) {
    x = (x + 1) / 2;
    return Math.floor(256 * x);
}

function f1(time, x, y) {
    return Math.sin(x / 40.74 - time);
}

function f2(time, x, y) {
    return Math.sin(
        dist(
            x, y,
            Math.sin(-time * 0.9) * Math.cos(-time * 0.98) * 128 + 128,
            Math.cos(-time * 0.78) * Math.sin(-time * 0.89) * 128 + 128
        )
            / 50.74);
}

function color1(x) {
    var r = x / 255;
    var g = 0.5;
    var b = 1 - (x / 255);

    r = r * r;
    g = g * g;
    b = b * b;

    return {r: r, g: g, b: b};
}

function color2(x) {
    var r = normalize1(Math.cos(3.1415 * x / 128));
    var g = 0.25;
    var b = Math.min(1, 0.5 + normalize1(Math.sin(3.1415 * x / 128)));
    return {r: r, g: g, b: b};
}

color2 = _.memoize(color2);

var Plasma1 = base.Effect.extend({
    initialize: function () {
        console.log('static init');

        this.on('render', _.bind(this.render, this));

        this.colors = [];
        this.color1 = {r: 1, g: 0, b: 0};
        this.color2 = {r: 0, g: 1, b: 0};
        this.color3 = {r: 0, g: 0, b: 1};
        this.calcColormap();

        this.value = 0;
        this.enabled = false;

        this.time = 0;
        this.lastTime = Date.now();
        this.speed = 100;

        remote.on('osc:/2/fader8', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle8', _.bind(this.onToggle, this));

        remote.on('osc:/1/fader2', _.bind(this.onSpeed, this));

        web.on('color:plasma1', _.bind(this.setPlasma1, this));
        web.on('color:plasma2', _.bind(this.setPlasma2, this));
        web.on('color:plasma3', _.bind(this.setPlasma3, this));
    },

    render: function () {

        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        var idx = 0;

        var time = Date.now();
        this.time += (time - this.lastTime) / (100000 / this.speed);
        this.lastTime = time;

        _.each(fixs, function (fix) {

            var len = fix.length;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var value = f1(that.time, i * 8, idx * 8) + f2(that.time, i * 8, idx * 8);

                value = normalize256(value / 2);

                var c = that.colors[(Math.floor(value))] || 0;

                ins.set('intensity', 1, that.value);
                ins.set('red', c.r, that.value);
                ins.set('green', c.g, that.value);
                ins.set('blue', c.b, that.value);

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

    setPlasma1: function (color) {
        console.log('set plasma1', color);
        this.color1 = color;

        this.calcColormap();
    },

    setPlasma2: function (color) {
        console.log('set plasma2', color);
        this.color2 = color;

        this.calcColormap();
    },

    setPlasma3: function (color) {
        console.log('set plasma3', color);
        this.color3 = color;

        this.calcColormap();
    },

    calcColormap: function () {

        this.colors = new Array(256);

        var i, s, e;
        for (i = 0; i < 128; i++) {

            s = i / 128;
            e = 1 - s;

            s=s*s;
            e=e*e;

            this.colors[i] = {
                r: this.color1.r * e + this.color2.r * s,
                g: this.color1.g * e + this.color2.g * s,
                b: this.color1.b * e + this.color2.b * s
            }
        }

        for (i = 0; i < 128; i++) {

            s = i / 128;
            e = 1 - s;

            s=s*s;
            e=e*e;

            this.colors[i+128] = {
                r: this.color2.r * e + this.color3.r * s,
                g: this.color2.g * e + this.color3.g * s,
                b: this.color2.b * e + this.color3.b * s
            }
        }
    },

    onSpeed: function (value) {
        this.speed = 1 + 999 * value;
    }
});

manager.effects.add(new Plasma1);
