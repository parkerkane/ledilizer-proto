require('./plasma.js');
require('./basic.js');
require('./random.js');
require('./moving.js');

var shuffle = function (o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x) {
        ;
    }
    return o;
};