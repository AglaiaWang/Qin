var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path'),
    ttf2eot = require('ttf2eot');

module.exports = function(dist, options) {
    return new Deferred().outer(function(that) {
        fs.readFile(path.join(dist, options.dir2, options.fontName + '.ttf'), function(err, data) {
            if (err) {
                that.resolve({
                    err: true,
                    msg: 'TTF Font File Not Found!'
                });
            } else {
                var eot = ttf2eot(data, {});
                fs.writeFile(path.join(dist, options.dir2, options.fontName + '.eot'), new Buffer(eot.buffer), function(err, data) {
                    if (err) {
                        that.resolve({
                            err: true,
                            msg: 'EOT Font File Write Error!'
                        });
                    } else {
                        that.resolve({
                            err: false,
                            path: path.join(dist, options.dir2, options.fontName + '.eot')
                        });
                    }
                });
            }
        });
    });
};
