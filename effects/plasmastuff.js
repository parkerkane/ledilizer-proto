function Plasma(target) {
    var _pixels = [];
    var _pxWidth = 8;
    var _pxHeight = 8;
    var _delta = .15;
    var _animating = false;
    var _patterns = [];
    var _time = 0;
    var _palette = [];
    var _timeout = 0;
    var _interlaceStart = 0;
    var _interlacing = false;
    
    generateCanvas();
    
    function generateCanvas() {
        for (var x = 0; x < 256; x += _pxWidth) {
            _pixels[x] = [];
            for (var y = 0; y < 256; y += _pxHeight) {
                var elt = document.createElement('div');
                elt.style.width = _pxWidth + 'px';
                elt.style.height = _pxWidth + 'px';
                elt.style.left = x + 'px';
                elt.style.top = y + 'px';
                target.appendChild(elt);
                _pixels[x][y] = elt;
            }
        }
    };
    
    function updateColors() {
        var minColor = 256;
        var maxColor = 0;
        for (var x = 0; x < 256; x += _pxWidth) {
            //for (var y = 0; y < 256; y += _pxHeight) {
            var start = 0, delta = _pxHeight;
            if (_interlacing) {
                start = _interlaceStart;
                delta = _pxHeight * 2;
            }
            for (var y = start; y < 256; y += delta) {
                var value = 0;
                for (var i = 0; i < _patterns.length; i++) {
                     value += _patterns[i](_time, x, y);
                }

                var c = normalize256(value / _patterns.length);
                //c = (c + 1) / 2;
                //c = Math.floor(255 * c);
                
                var color = Math.round(c);
                maxColor = Math.max(maxColor, color);
                minColor = Math.min(minColor, color);

                _pixels[x][y].style.backgroundColor = _palette[color];
            }
        }
        _interlaceStart = _interlaceStart ? 0 : _pxHeight;
        _time += _delta;
        if(_animating) {                           
            _palette.push(_palette.shift());
            setTimeout(updateColors, 50);
        }
    };
    
    
    this.start = function() {
        if (!_animating) {
            _animating = true;
            updateColors();
        }
    };
    
    target.onclick = function() {
        _animating = !_animating;
        if (_animating) {
            updateColors();
        }
    };
    
    this.setPalette = function(f) {
        for (var i = 0; i < 256; i++) {
            var rgb = f(i);
            _palette[i] = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
        }
    };
    
    this.togglePattern = function(pattern) {
        for (var i = 0; i < _patterns.length; i++) {
            if (_patterns[i] === pattern) {
                _patterns.splice(i, 1);
                return;
            }
        }
        _patterns.push(pattern);
    };
    
};


function dist(a, b, c, d) {
    return Math.sqrt(((a - c) * (a - c) + (b - d) * (b - d)));
};


function normalize256(x) {
    x = (x + 1) / 2;
    return Math.floor(256 * x);
};


function main() {
    var plasma = new Plasma(document.getElementById('target'));

    function p1(x) {
        return {r:x, g:x, b:x};
    };

    function p2(x) {
        var r=0; var g = 0; var b = 128;
        var r = normalize256(Math.cos(3.1415 * x / 128));
        var g = normalize256(Math.sin(3.1415 * x / 128));
        return {r:r, g:g, b:b};
    };                                          
    
    function f1(time, x, y) {
        return Math.sin(x / 40.74 + time);
    };
    
    function f2(time, x, y) {
        return Math.sin(
            dist(
                    x, y, 
                    Math.sin(-time) * 128 + 128, 
                    Math.cos(-time) * 128 + 128
                )
            / 40.74) ;
    };
    
    plasma.setPalette(p2);
    plasma.togglePattern(f1);
    plasma.togglePattern(f2);
    //plasma.start();
};

main();


