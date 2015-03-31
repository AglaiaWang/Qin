var Deferred = require('../async/deferred'),
    queue = require('../async/queue'),
    svg2png = require('svg2png'),
    path = require('path');

function toPng(srcFile, toFile) {
    return new Deferred().outer(function(that) {
        svg2png(srcFile, toFile, function(err) {
            that.resolve({
                err : !!err
            });
        });
    });
}

module.exports = function(glyphs, dist) {
    var taskList = glyphs.map(function(glyph) {
        return toPng(glyph.path, path.join(dist, 'png', 'origin', glyph.name + '.png'));
    });

    return queue(taskList);
};
