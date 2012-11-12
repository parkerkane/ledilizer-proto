var seedValue = 0;

exports.seed = function (seed) {
    seedValue = Math.floor(seed) & 0x7FFFFFFF;

    exports.getInt();
    exports.getInt();
    exports.getInt();
    exports.getInt();
    exports.getInt();
    exports.getInt();
    exports.getInt();
    exports.getInt();
};

exports.getInt = function () {

    seedValue = (8253729 * seedValue + 2396403) & 0x7FFFFFFF;

    return seedValue;
};

exports.getBit = function () {
    return this.getInt() & 1;
};

exports.getFloat = function () {
    return this.getInt() / 0x7FFFFFFF;
};