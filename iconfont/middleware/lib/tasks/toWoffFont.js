var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path'),
    ttf2woff = require('ttf2woff');

module.exports = function(dist, options) {
    return new Deferred().outer(function(that) {
        fs.readFile(path.join(dist, options.dir2, options.fontName + '.ttf'), function(err, data) {
            if (err) {
                that.resolve({
                    err: true,
                    msg: 'TTF Font File Not Found!'
                });
            } else {
                var woff = ttf2woff(data, {});
                fs.writeFile(path.join(dist, options.dir2, options.fontName + '.woff'), new Buffer(woff.buffer), function(err, data) {
                    if (err) {
                        that.resolve({
                            err: true,
                            msg: 'WOFF Font File Write Error!'
                        });
                    } else {
                        that.resolve({
                            err: false,
                            path: path.join(dist, options.dir2, options.fontName + '.woff')
                        });
                    }
                });
            }
        });
    });
};
