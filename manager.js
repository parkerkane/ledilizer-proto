var async = require('async');
var _ = require('underscore');
var Backbone = require('backbone');

var fixtureClasses = exports.Fixtures = {};
exports.Effects = {};
exports.Modules = {};

var FixtureManager = exports.FixtureManager = function () {

    this.initialize.apply(this, arguments);

};

_.extend(FixtureManager.prototype, Backbone.Events, {

    initialize: function () {

        this.fixtures = [];
        this.gidCache = {};

    },

    add: function (fixtureName, universe, fixtureData) {

        var fixtureClass = fixtureClasses[fixtureName];

        console.log('Adding', fixtureName, '@', universe, ':', fixtureData);

        if (_.isUndefined(fixtureClass)) {
            console.err('Fixture not found:', fixtureName);
            return;
        }

        var fixture = new fixtureClass(universe);

        _.each(fixtureData, function (val, key) {
            fixture[key] = val;
        });

        this.fixtures.push(fixture);

        return fixture;
    },

    getByGid: function (groupId) {

        if (_.isUndefined(this.gidCache[groupId])) {

            this.gidCache[groupId] = this.filter(function (fix) {
                return _.contains(fix.groups, groupId);
            });

        }

        return this.gidCache[groupId];

    },

    render: function () {

        _.each(this.fixtures, function (fix) {
            fix.render();
        });
    },

    reset: function () {
        _.each(this.fixtures, function (fix) {
            fix.reset();
        });
    },

    map: function (callback) {
        return _.map(this.fixtures, callback);
    },

    each: function (callback) {
        return _.each(this.fixtures, callback);
    },

    filter: function (callback) {
        return _.filter(this.fixtures, callback);
    },

    where: function (obj) {
        return _.where(this.fixtures, obj);
    }

});

var EffectManager = exports.EffectManager = function () {

    this.effects = [];

    this.initialize.apply(this, arguments);

};

_.extend(EffectManager.prototype, Backbone.Events, {

    initialize: function () {

    },

    render: function () {
        _.each(this.effects, function (eff) {
            eff.trigger('render');
        })
    },

    add: function (effect) {

        this.effects.push(effect);

    }
});
exports.fixtures = new FixtureManager();
exports.effects = new EffectManager();
