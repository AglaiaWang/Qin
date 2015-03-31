var Deferred = require('../async/deferred'),
    queue = require('../async/queue'),
    gm = require('gm'),
    fs = require('fs'),
    path = require('path'),
    imageMagick = gm.subClass({
        imageMagick: true
    });

function resize(srcFile, toFile, width, height) {
    return new Deferred().outer(function(that) {
        imageMagick(srcFile)
            .resize(width, height, '!')
            .write(toFile, function(err) {
                that.resolve({
                    err : !!err
                });
            });
    });
}

module.exports = function(glyphs, dist, sizes) {
    var taskList = [];
    glyphs.forEach(function(glyph) {
        sizes.forEach(function(size) {
            taskList.push(resize(
                path.join(dist, 'png', 'origin', glyph.name + '.png'),
                path.join(dist, 'png', size.toString(), glyph.name + '.png'),
                size, size
            ));
        });
    });

    return queue(taskList);
};
