var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path'),
    svg2ttf = require('svg2ttf');

module.exports = function(dist, options) {
    return new Deferred().outer(function(that) {
        fs.readFile(path.join(dist, options.dir2, options.fontName + '.svg'), function(err, data) {
            if (err) {
                that.resolve({
                    err: true,
                    msg: 'SVG Font File Not Found!'
                });
            } else {
                var ttf = svg2ttf(data.toString(), {});
                fs.writeFile(path.join(dist, options.dir2, options.fontName + '.ttf'), new Buffer(ttf.buffer), function(err, data) {
                    if (err) {
                        that.resolve({
                            err: true,
                            msg: 'TTF Font File Write Error!'
                        });
                    } else {
                        that.resolve({
                            err: false,
                            path: path.join(dist, options.dir2, options.fontName + '.ttf')
                        });
                    }
                });
            }
        });
    });
};
