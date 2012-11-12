var _ = require('underscore');

var base = require('../base.js');
var remote = require('../remote.js');

var Fixtures = require('../manager.js').Fixtures;
var Modules = require('../manager.js').Modules;

var Dimmer_8 = Modules.Dimmer_8 = base.Module.extend({

    channels: {
        intensity: 1
    },

    masterIntensity: 1,
    blackout: false,
    intensity: 0,

    initialize: function () {
        remote.on('osc:/1/fader1', _.bind(this.onMasterInt, this));
        remote.on('osc:/1/toggle1', _.bind(this.onBlackout, this));
    },

    onMasterInt: function (val) {
        this.masterIntensity = val;
    },

    onBlackout: function (val) {
        console.log('set blackout', val);

        this.blackout = val === 1;
    },

    get render_intensity() {
//        console.log('render_intensity', this.blackout, this.masterIntensity, this.intensity);

        if (this.blackout) {
            return 0;
        }

        return this.masterIntensity * this.intensity;
    }

});

Fixtures.Dimmer_8 = base.Fixture.extend({

    modules: [
        {module: Dimmer_8, channel: 1}
    ]

});

Fixtures.Showtec_Sunstrip = base.Fixture.extend({

    modules: [
        {module: Dimmer_8, channel: 1},
        {module: Dimmer_8, channel: 2},
        {module: Dimmer_8, channel: 3},
        {module: Dimmer_8, channel: 4},
        {module: Dimmer_8, channel: 5},
        {module: Dimmer_8, channel: 6},
        {module: Dimmer_8, channel: 7},
        {module: Dimmer_8, channel: 8},
        {module: Dimmer_8, channel: 9},
        {module: Dimmer_8, channel: 10}
    ]

});