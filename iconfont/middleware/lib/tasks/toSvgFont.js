var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path'),
    svgicons2svgfont = require('svgicons2svgfont'),
    db = require('./../../../models')

module.exports = function (files, codepoints, dist, options) {

    return new Deferred().outer(function(that) {
        var glyphs = files.map(function(file, index) {
            var codepoint = codepoints[index] || baseIndex;
            return {
                codepoint: codepoint,
                content: codepoint.toString(16),
                name: options.fontName.toLowerCase() + '-' +options.config[path.basename(file,path.extname(file))].name,
                path: file,
                stream: fs.createReadStream(file)
            };
        });

        try {
            svgicons2svgfont(glyphs, options)
                .pipe(fs.createWriteStream(path.join(dist, options.dir2, options.fontName + '.svg')))
                .on('finish', function(data, err) {
                    that.resolve({
                        err: !!err,
                        map: glyphs.map(function(glyph) {
                            return {
                                codepoint: glyph.codepoint,
                                content: glyph.content,
                                name: glyph.name,
                                path: glyph.path
                            };
                        }),
                        path: path.join(dist, options.dir2, options.fontName + '.svg')
                    });
                });
        } catch (exp) {
            that.resolve({
                err: true,
                msg: exp
            });
        }
    });
};
