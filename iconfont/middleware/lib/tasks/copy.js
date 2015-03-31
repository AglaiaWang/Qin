var Deferred = require('../async/deferred'),
    queue = require('../async/queue'),
    fs = require('fs'),
    path = require('path');

function copy(srcFile, toFile) {
    return new Deferred().outer(function(that) {
        fs.readFile(srcFile, function(err, data) {
            if (err) {
                that.resolve({
                    err: true,
                    msg: 'Read "' + srcFile + '" Error!'
                });
            } else {
                fs.writeFile(toFile, data, function(err) {
                    if (err) {
                        that.resolve({
                            err: true,
                            msg: 'Write "' + toFile + '" Error!'
                        });
                    } else {
                        that.resolve({
                            err: false
                        });
                    }
                });
            }
        });
    });
}

module.exports = function(glyphs, dist) {

    var taskList = glyphs.map(function(glyph) {
        return copy(glyph.path, path.join(dist, 'svg', glyph.name + '.svg'));
    });

    return queue(taskList);

};
