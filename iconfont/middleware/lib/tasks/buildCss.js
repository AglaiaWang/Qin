var Deferred = require('../async/deferred'),
    fs = require('fs'),
    path = require('path'),
    template = require('ejs');

module.exports = function(glyphs, dist, options) {

    return new Deferred().outer(function(that) {
        //ejs渲染最终生成字体图标实例的css模板
        var str = fs.readFileSync(path.join(__dirname + '/template/style.css'), 'utf-8');
        var css = template.render(str,{
            fontPath: '../fonts/',
            fontName: options.fontName,
            className: options.className,
            glyphs: glyphs
        });

        fs.writeFile(path.join(dist, 'css', options.fontName.toLowerCase() + '.css'), css, 'utf-8', function(err) {
            that.resolve({
                err : !!err
            });
        });
    });

};
