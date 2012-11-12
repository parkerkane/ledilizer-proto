var _ = require('underscore');

var base = require('../base');
var remote = require('../remote');

var Fixtures = require('../manager').Fixtures;
var Modules = require('../manager').Modules;

var RGB_8 = Modules.RGB_8 = base.Module.extend({

    channels: {
        red: 1,
        green: 2,
        blue: 3
    },

    masterIntensity: 1,
    blackout: false,

    red: 0,
    green: 0,
    blue: 0,

    intensity: 1,

    initialize: function () {
        remote.on('osc:/1/fader1', _.bind(this.onMasterInt, this));
        remote.on('osc:/1/toggle1', _.bind(this.onBlackout, this));
    },

    onMasterInt: function (val) {
        this.masterIntensity = val;
    },

    onBlackout: function (val) {
        this.blackout = val === 1;
    },

    get render_red() {
        if (this.blackout) {
            return 0;
        }

        return this.masterIntensity * this.intensity * this.red;
    },

    get render_green() {
        if (this.blackout) {
            return 0;
        }

        return this.masterIntensity * this.intensity * this.green;
    },

    get render_blue() {
        if (this.blackout) {
            return 0;
        }

        return this.masterIntensity * this.intensity * this.blue;
    }
});

var RGBA_8 = Modules.RGBA_8 = base.Module.extend({

    channels: {
        red: 1,
        green: 2,
        blue: 3,
        intensity: 4
    },

    masterIntensity: 1,
    blackout: false,

    red: 0,
    green: 0,
    blue: 0,

    initialize: function () {
        remote.on('osc:/1/fader1', _.bind(this.onMasterInt, this));
        remote.on('osc:/1/toggle1', _.bind(this.onBlackout, this));
    },

    onMasterInt: function (val) {
        this.masterIntensity = val;
    },

    onBlackout: function (val) {
        this.blackout = val === 1;
    },

    get render_intensity() {
        if (this.blackout) {
            return 0;
        }

        return this.masterIntensity * this.intensity;
    }

});

Fixtures.ADJ_MegaTriBar_3CH = base.Fixture.extend({

    modules: [
        {module: RGB_8, channel: 1 },
        {module: RGB_8, channel: 4 },
        {module: RGB_8, channel: 7 },
        {module: RGB_8, channel: 10},
        {module: RGB_8, channel: 13},
        {module: RGB_8, channel: 16},
        {module: RGB_8, channel: 19},
        {module: RGB_8, channel: 22},
        {module: RGB_8, channel: 25},
        {module: RGB_8, channel: 28},
        {module: RGB_8, channel: 31},
        {module: RGB_8, channel: 34},
        {module: RGB_8, channel: 37},
        {module: RGB_8, channel: 40},
        {module: RGB_8, channel: 43},
        {module: RGB_8, channel: 46},
        {module: RGB_8, channel: 49},
        {module: RGB_8, channel: 52}
    ]

});

Fixtures.TP81_3CH = base.Fixture.extend({
    modules: [
        {module: RGB_8, channel: 1 },
        {module: RGB_8, channel: 4 },
        {module: RGB_8, channel: 7 },
        {module: RGB_8, channel: 10},
        {module: RGB_8, channel: 13},
        {module: RGB_8, channel: 16}
    ]
});

Fixtures.GenericRGB = base.Fixture.extend({
    modules: [
        {module: RGB_8, channel: 1}
    ]
});

Fixtures.GenericRGBA = base.Fixture.extend({
    modules: [
        {module: RGBA_8, channel: 1}
    ]
});