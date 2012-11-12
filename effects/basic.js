var _ = require('underscore');

var color = require('../color');
var remote = require('../remote');
var manager = require('../manager');
var base = require('../base');

var StaticWhite = base.Effect.extend({
    initialize: function () {
        console.log('static init');

        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;
        this.enabledZ = false;

        remote.on('osc:/2/fader1', _.bind(this.onFader, this));
        remote.on('osc:/2/toggle1', _.bind(this.onToggle, this));

        remote.on('osc:/2/fader1/z', _.bind(this.onFaderZ, this));
    },

    render: function () {

        if (!this.enabled || !this.enabledZ) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);
        var that = this;

        _.each(fixs, function (fix) {

            fix.set('intensity', 1, that.value);

            fix.set('red', 1, that.value);
            fix.set('green', 1, that.value);
            fix.set('blue', 1, that.value);

        });
    },

    onFader: function (value) {
        this.value = value;
    },

    onFaderZ: function (value) {
        this.enabledZ = !!value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    }
});

manager.effects.add(new StaticWhite);

//var Static = base.Effect.extend({
//    initialize: function () {
//        console.log('static init');
//
//        this.on('render', _.bind(this.render, this));
//
//        this.value = 0;
//        this.enabled = false;
//
//        this.hue = 0;
//        this.saturation = 0;
//        this.colorValue = 0;
//
//        this.red = 1;
//        this.green = 1;
//        this.blue = 1;
//
//        remote.on('osc:/2/fader2', _.bind(this.onFader, this));
//        remote.on('osc:/2/toggle2', _.bind(this.onToggle, this));
//
//        remote.on('osc:/1/xy', _.bind(this.onXY, this));
//        remote.on('osc:/1/fader4', _.bind(this.onValue, this));
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
//        _.each(fixs, function (fix) {
//
//            fix.set('intensity', 1, that.value);
//
//            fix.set('red', that.red, that.value);
//            fix.set('green', that.green, that.value);
//            fix.set('blue', that.blue, that.value);
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
//    onXY: function (saturation, hue) {
//
//        this.hue = hue;
//        this.saturation = 1 - saturation;
//
//        this.updateColor();
//    },
//
//    onValue: function (value) {
//        this.colorValue = value;
//
//        this.updateColor();
//    },
//
//    updateColor: function () {
//
//        var c = color.hsvToRgb(this.hue, this.saturation, this.colorValue);
//
//        this.red = c.r;
//        this.green = c.g;
//        this.blue = c.b;
//
//    }
//});

//manager.effects.add(new Static);

var IdentityWhite = base.Effect.extend({
    initialize: function () {
        console.log('static init');

        this.on('render', _.bind(this.render, this));

        this.value = 0;
        this.enabled = false;

        remote.on('osc:/3/fader1', _.bind(this.onFader, this));
        remote.on('osc:/3/toggle1', _.bind(this.onToggle, this));
    },

    render: function () {

        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(0);

        var that = this;

        _.each(fixs, function (fix) {

            var value = this.value;

            var len = fix.length;

            for (var i = 0; i < len; i++) {
                var ins = fix.get(i);

                var tst = i < 4 || i > len - 3;

                ins.set('intensity', tst ? 1 : 0, that.value);

                var r=1;
                var g=1;
                var b=1;

                if (i==1) {
                    r=1;
                    g=b=0;

                } else if (i==2) {
                    g=1;
                    r=b=0;

                } else if (i==3) {
                    b=1;
                    r=g=0;

                }

                ins.set('red', r, that.value);
                ins.set('green', g, that.value);
                ins.set('blue', b, that.value);
            }


        });
    },

    onFader: function (value) {
        this.value = value;
    },

    onToggle: function (value) {
        this.enabled = !!value;
    }
});

manager.effects.add(new IdentityWhite);

var WhiteFlash = base.Effect.extend({
    initialize: function (buttonId, id) {
        console.log('static init');

        this.gid = id;
        this.on('render', _.bind(this.render, this));

        this.enabled = false;
        this.value = 1;

        remote.on('osc:' + buttonId, _.bind(this.onToggle, this));
        remote.on('osc:/1/fader4', _.bind(this.onValue, this));
    },

    render: function () {

        if (!this.enabled) {
            return;
        }

        var fixs = manager.fixtures.getByGid(this.gid);
        var that = this;

        _.each(fixs, function (fix) {

            fix.set('intensity', that.value, 1);

            fix.set('red', that.value, 1);
            fix.set('green', that.value, 1);
            fix.set('blue', that.value, 1);

        });
    },

    onToggle: function (value) {
        this.enabled = !!value;
    },

    onValue: function (value) {
        this.value = value;
    }
});

manager.effects.add(new WhiteFlash('/1/push1', 1));
manager.effects.add(new WhiteFlash('/1/push2', 2));
manager.effects.add(new WhiteFlash('/1/push3', 3));
manager.effects.add(new WhiteFlash('/1/push4', 4));
manager.effects.add(new WhiteFlash('/1/push5', 5));