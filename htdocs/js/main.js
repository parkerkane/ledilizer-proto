var $dmx = [];
var selectedUniverse = 0;

var dmxData = null;

window.WebSocket = window.WebSocket || window.MozWebSocket;

function setupDmxDisplay() {
    var $row;

    for (var i = 0; i < 512; i++) {

        if (i % 10 == 0) {
            $row = $('<div>').addClass('row').appendTo('#dmxcontent');

            $('<div>').text(Math.floor(i / 10) * 10).addClass('span1 gray').appendTo($row);
        }

        var $span = $('<div>').addClass('span1');
        $span.appendTo($row);

        $span.text(0);
        $span.attr('title', 'Dmx: ' + (i + 1));

        $dmx[i] = $span;
    }

    var $dmxUniverse = $('.dmxuniverse');
    var $fixUniverse = $('.fixuniverse');
    var $colorMenu = $('.colormenu');

    $dmxUniverse.first().addClass('active');
    selectedUniverse = parseInt($dmxUniverse.first().data('universe'));

    $dmxUniverse.click(function () {

        $dmxUniverse.removeClass('active');
        $fixUniverse.removeClass('active');
        $colorMenu.removeClass('active');

        $(this).addClass('active');

        selectedUniverse = parseInt($(this).data('universe'));

        $('#dmxcontent').show();
        $('#fixcontent').hide();
        $('#colorcontent').hide();

    });
}

function setupFixDisplay() {

    var $dmxUniverse = $('.dmxuniverse');
    var $fixUniverse = $('.fixuniverse');
    var $colorMenu = $('.colormenu');

    $fixUniverse.click(function () {

        $dmxUniverse.removeClass('active');
        $fixUniverse.removeClass('active');
        $colorMenu.removeClass('active');

        $(this).addClass('active');

        $('#fixcontent').show();
        $('#dmxcontent').hide();
        $('#colorcontent').hide();

    });
}

function sendColor(rgb, id) {
    var r = rgb.r / 255;
    var g = rgb.g / 255;
    var b = rgb.b / 255;

    connection.send(JSON.stringify({
        type:'color',
        id:id,
        r:r,
        g:g,
        b:b
    }));
}

function setupColors() {

    var $dmxUniverse = $('.dmxuniverse');
    var $fixUniverse = $('.fixuniverse');
    var $colorMenu = $('.colormenu');

    $colorMenu.click(function () {

        $dmxUniverse.removeClass('active');
        $fixUniverse.removeClass('active');
        $colorMenu.removeClass('active');

        $(this).addClass('active');

        $('#fixcontent').hide();
        $('#dmxcontent').hide();
        $('#colorcontent').show();

    });

    $('.sinecolor').jPicker({
        window: {title: 'Sine color'}
    }, function (color, ctx) {

        sendColor(color.val('rgb'), 'sinecolor');
    });
    $('.sawcolor').jPicker({
        window: {title: 'Saw color'}
    }, function (color, ctx) {

        sendColor(color.val('rgb'), 'sawcolor');
    });
    $('.3rdcolor').jPicker({
        window: {title: '3rd color'}
    }, function (color, ctx) {

        sendColor(color.val('rgb'), '3rdcolor');
    });


    $('#plasma1').jPicker({
        window: {title: 'Plasma color1'}

    }, function (color, ctx) {
        sendColor(color.val('rgb'), 'plasma1');
    });

    $('#plasma2').jPicker({
        window: {title: 'Plasma color2'}

    }, function (color, ctx) {
        sendColor(color.val('rgb'), 'plasma2');
    });
    $('#plasma3').jPicker({
        window: {title: 'Plasma color3'}

    }, function (color, ctx) {
        sendColor(color.val('rgb'), 'plasma3');
    });
}

var fixCache = {};
var fixData = [];

function resetFixDisplay() {
    fixCache = {};
    $('#fixcontent > *').remove();
}

function updateFixData() {

    var $fixContent = $('#fixcontent');

    _.each(fixData, function (fix) {

        if (_.isUndefined(fixCache[fix.id])) {

            var $row = $('<div>').addClass('row');

            $('<div>').addClass('span1 gray').text(fix.uni + ':' + fix.ch).appendTo($row);

            $fixContent.append($row);

            fixCache[fix.id] = $row;

            _.each(fix.mod, function (mod) {

                var $mod = $('<div>').addClass('rgbmod').appendTo($row);

                fixCache[mod.id] = $mod;

            })
        }

        _.each(fix.mod, function (mod) {
            var $mod = fixCache[mod.id];

            var red = Math.floor(mod.red * 255);
            var green = Math.floor(mod.green * 255);
            var blue = Math.floor(mod.blue * 255);

            $mod.css({
                backgroundColor: 'rgb(' + red + ',' + green + ',' + blue + ')'
            });
        })
    });

}

var connection;

function connectToServer() {

    connection = new WebSocket('ws://127.0.0.1:5000');
    console.log(connection);

    connection.onopen = function () {
        console.log('ws onopen');

        resetFixDisplay();
    };

    connection.onerror = function () {
        console.log('ws onerror');

        _.delay(connectToServer, 1000);
    };

    connection.onclose = function () {
        console.log('ws onclose');

        _.delay(connectToServer, 1000);
    };

    connection.onmessage = function (message) {

        var parsed = JSON.parse(message.data);

        if (parsed.type === 'dmx') {

            dmxData = parsed.content;
        } else if (parsed.type === 'fix') {

            fixData = parsed.content;
        }

    };
}

$(function () {
    setupDmxDisplay();
    setupFixDisplay();
    setupColors();

    connectToServer();

    setInterval(function () {

        if (_.isNull(dmxData)) {
            return;
        }

        for (var i = 0; i < 512; i++) {
            $dmx[i].text(dmxData[selectedUniverse][i]);
        }

        updateFixData();

    }, 1000 / 10);

});
