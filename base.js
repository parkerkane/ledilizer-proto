var _ = require('underscore');
var Backbone = require('backbone');

var dmx = require('./dmx');

var Module = exports.Module = function (parent) {
    this.id = _.uniqueId('mod_');

    this.parent = parent;

    this.on('render', _.bind(this.render, this));
    this.on('reset', _.bind(this.render, this));

    this.initialize.apply(this, arguments);

    this.reset();

};

_.extend(Module.prototype, Backbone.Events, {
    channel: 0,
    channels: {},
    jsonData: {},

    initialize: function () {
    },

    render: function () {
        var that = this;

        _.each(this.valueTotals, function (valueTotal, key) {
            var weights = that.valueWeights[key];

            var maxValue = _.max(weights);

            if (maxValue == 0) {
                return;
            }

            var ratio = 1.0 / maxValue;

            var normalizedWeightRatio = _.reduce(weights, function (memo, num) {
                return memo + num * ratio;
            }, 0);

            var value;

            if (normalizedWeightRatio != 0) {
                value = valueTotal / normalizedWeightRatio;
            } else {
                value = 0;
            }

            that[key] = value;

        });

        this.jsonData = {id: this.id};

        var parentChannel = this.parent.dmxChannel;
        var parentUniverse = this.parent.dmxUniverse;

        var dmxBaseChannel = parentChannel + this.dmxChannel;

        _.each(this.channels, function (channel, key) {
            var data;
            var dataValue = that['render_' + key];

            if (_.isUndefined(dataValue)) {
                dataValue = that[key];
            }

            that.jsonData[key] = dataValue;

            if (_.isObject(channel)) {
                data = Math.max(0, Math.min(0xFFFF, dataValue * 0xFFFF));

                var hi = (data >> 8) & 0xFF;
                var lo = data & 0xFF;

                dmx.setDMX(parentUniverse, dmxBaseChannel + channel.hi, hi);
                dmx.setDMX(parentUniverse, dmxBaseChannel + channel.lo, lo);

            } else {
                data = Math.max(0, Math.min(0xFF, dataValue * 0xFF));

                dmx.setDMX(parentUniverse, dmxBaseChannel + channel, data);
            }

        });
    },

    reset: function () {

        var that = this;

        _.each(this.valueTotals, function (val, key) {
            that[key] = 0;
        });

        this.valueTotals = {};
        this.valueWeights = {};
    },

    get dmxChannel() {

        return this.channel - 1;
    },

    set: function (channelName, value, weight) {
//        console.log('set', channelName, value, weight);

        if (_.isUndefined(weight)) {
            weight = 1;
        }

        value = value * weight;

        if (_.isUndefined(this.valueTotals[channelName])) {

            this.valueTotals[channelName] = 0;
            this.valueWeights[channelName] = [];

        }

        this.valueTotals[channelName] += value;
        this.valueWeights[channelName].push(weight);

    },

    get: function (channelName) {
        return this[channelName];
    }
});

var Fixture = exports.Fixture = function (universe, channel) {
    this.id = _.uniqueId('fix_');

    if (_.isUndefined(channel)) {
        channel = 1;
    }

    this.universe = universe;
    this.channel = channel;

    this.on('render', _.bind(this.render, this));
    this.on('reset', _.bind(this.reset, this));

    this.instances = [];
    var that = this;

    if (_.isNull(this.modules)) {
        throw "No modules found";
    }

    this.modules.forEach(function (insdata) {
        var instance = new insdata.module(that);

        _.each(insdata, function (val, key) {
            if (key === 'module') {
                return;
            }
            if (key === 'channel') {
                val = val - 1;
            }

            instance[key] = val;
        });

        that.instances.push(instance);
    });

    this.initialize.apply(this, arguments);

//    console.log('tst', this.length);

};

_.extend(Fixture.prototype, Backbone.Events, {
    channels: {},
    modules: null,

    initialize: function () {
    },

    render: function () {
        _.each(this.instances, function (ins) {
            ins.render();
        });
    },

    reset: function () {
        _.each(this.instances, function (ins) {
            ins.reset();
        });
    },

    get dmxChannel() {
        return this.channel - 1;
    },

    get dmxUniverse() {
        return this.universe - 1;
    },

    set: function (channel, value, weight) {
        var that = this;

        this.instances.forEach(function (instance) {
            instance.set(channel, value, weight);
        })
    },

    get: function (id) {
        id = Math.max(0, Math.min(this.instances.length - 1, id));

        if (this.invert) {
            id = (this.instances.length-1) - id;
        }

        return this.instances[id];
    },

    get length() {

        return this.instances.length;
    },

    get jsonData() {
        return {
            id: this.id,
            ch: this.channel,
            uni: this.universe,
            mod: _.map(this.instances, function (ins) {
                return ins.jsonData;
            })
        }
    }
});

var Effect = exports.Effect = function () {

    this.initialize.apply(this, arguments);

};

_.extend(Effect.prototype, Backbone.Events, {
    initialize: function () {
    }
});

// Copied from Backbone

// The self-propagating extend function that Backbone classes use.
var extend = function (protoProps, classProps) {
    var child = inherits(this, protoProps, classProps);
    child.extend = this.extend;
    return child;
};

Module.extend = Fixture.extend = Effect.extend = extend;

// Helpers
// -------

// Shared empty constructor function to aid in prototype-chain creation.
var ctor = function () {
};

// Helper function to correctly set up the prototype chain, for subclasses.
// Similar to `goog.inherits`, but uses a hash of prototype properties and
// class properties to be extended.
var inherits = function (parent, protoProps, staticProps) {
    var child;

    // The constructor function for the new subclass is either defined by you
    // (the "constructor" property in your `extend` definition), or defaulted
    // by us to simply call the parent's constructor.
    if (protoProps && protoProps.hasOwnProperty('constructor')) {
        child = protoProps.constructor;
    } else {
        child = function () {
            parent.apply(this, arguments);
        };
    }

    // Inherit class (static) properties from parent.
    _.extend(child, parent);

    // Set the prototype chain to inherit from `parent`, without calling
    // `parent`'s constructor function.
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();

    // Add prototype properties (instance properties) to the subclass,
    // if supplied.
    if (protoProps) {
        _.extend(child.prototype, protoProps);
    }

    // Add static properties to the constructor function, if supplied.
    if (staticProps) {
        _.extend(child, staticProps);
    }

    // Correctly set child's `prototype.constructor`.
    child.prototype.constructor = child;

    // Set a convenience property in case the parent's prototype is needed later.
    child.__super__ = parent.prototype;

    return child;
};
