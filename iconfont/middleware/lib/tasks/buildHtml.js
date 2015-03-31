var Deferred = require('../async/deferred.js'),
    fs = require('fs'),
    path = require('path'),
    template = require('ejs');

module.exports = function(groups, glyphs, dist, options) {
    return new Deferred().outer(function(that) {
        //ejs渲染最终生成字体图标实例的html模板
        var str = fs.readFileSync(path.join(__dirname + '/template/index.ejs'), 'utf-8');
        var html = template.render(str,{
            fontPath: '../fonts/',
            fontTitle: options.fontName,
            fontName: options.fontName.toLowerCase(),
            className: options.className,
            groups: groups,
            glyphs: glyphs,
            total: glyphs.length,
            zipFile: options.zip || '#'
        });
        fs.writeFile(path.join(dist, 'index.html'), html, 'utf-8', function(err) {
            that.resolve({
                err : !!err
            });
        });
    });

};
