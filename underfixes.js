var _ = require('underscore');

_.mixin({

    extend: function (obj) {
        _.each(Array.prototype.slice.call(arguments, 1), function (source) {
            for (var prop in source) {

                var getter = source.__lookupGetter__(prop);
                var setter = source.__lookupSetter__(prop);

                if (!_.isUndefined(getter)) {
                    obj.__defineGetter__(prop, getter);
                }

                if (!_.isUndefined(setter)) {
                    obj.__defineSetter__(prop, setter);
                }

                if (_.isUndefined(getter) && _.isUndefined(setter)) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;

    }
});

