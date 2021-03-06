/*
* @author missy missy.liu@qunar.com 2015-01-05 based on previous version
* 生成font、html、css、zip函数
*/
var Deferred = require('./async/deferred'),
    queue = require('./async/queue'),
    fs = require('fs'),
    path = require('path');

var createDir = require('./tasks/createDir'),
    toSvgFont = require('./tasks/toSvgFont'),
    toTtfFont = require('./tasks/toTtfFont'),
    toEotFont = require('./tasks/toEotFont'),
    toWoffFont = require('./tasks/toWoffFont'),
    copySvg = require('./tasks/copy'),
    buildCss = require('./tasks/buildCss'),
    buildHtml = require('./tasks/buildHtml'),
    zipDir = require('./tasks/zipDir');

module.exports = function(source, dist, options) {
    var config = {},
        files = [],
        codepoints = [],
        groups = [],
        groupMap = {};

    var task = (function() {

        var taskList = [],
            paramList = [];

        return {
            push : function(key, deferred) {
                paramList.push(key);
                taskList.push(function(data, ret) {
                    if (data && data.err) {
                        return {};
                    } else {
                        if (typeof deferred == 'function') {
                            return deferred(ret);
                        } else {
                            return deferred;
                        }
                    }
                });
            },
            run : function() {
                return new Deferred().outer(function(that) {
                    queue(taskList, paramList).done(function() {
                        that.resolve(false);
                    }).fail(function() {
                        that.resolve(true);
                    }).progress(function(key, data) {
                        that.notify(key, data);
                    });
                });
            }
        };

    })();

    function addGroup(name) {
        if (!~groups.indexOf(name)) {
            groups.push(name);
        }
    }

    config = JSON.parse(options.fileJSON);
    console.log(config)
    for (var key in config) {
        key = key+"";
        if (typeof config[key] == 'string') {
            config[key] = {
                code: config[key],
                group: 'Common'
            };
        } else if (!config[key].group){
            config[key].group = 'Common';
        }
        addGroup(config[key].group);
        groupMap[config[key].code] = config[key].group;
        if(fs.existsSync(path.join(source, key + '.svg'))) {
            files.push(path.join(source, key + '.svg'));
            codepoints.push(parseInt(config[key].code, 16));
        } else {
            console.log("SVG文件："+path.join(source, key + '.svg')+" 不存在");
        }
    }
    if(files.length<=0){
        console.log('没有可以转换的SVG');
        return;
    }
    options.fontName = options.fontName || 'iconfront';
    options.config = config;
    options.className = options.className || 'qif';
    options.dir2 = options.dir2 || 'fonts';

    task.push('dist_dir', createDir(dist));

    task.push('fonts_dir', createDir(path.join(dist, options.dir2)));

    task.push('css_dir', createDir(path.join(dist, 'css')));

    task.push('svg_font', toSvgFont(files, codepoints, dist, options));

    task.push('ttf_font', toTtfFont(dist, options));

    task.push('eot_font', toEotFont(dist, options));

    task.push('woff_font', toWoffFont(dist, options));

    task.push('css_build', function(ret) {
        return buildCss(ret.svg_font.map, dist, options);
    });

    task.push('html_build', function(ret) {
        var list = ret.svg_font.map,
            all = {};

        groups.forEach(function(name) {

            all[name] = [];
        });
        list.forEach(function(font) {
            console.error(groupMap[font.content],font.content,font)
            all[groupMap[font.content]||groupMap[font.content.toUpperCase()]].push(font);
        });
        all.length = list.length;

        return buildHtml(groups, all, dist, options);
    });

    if (options.zip) {
        task.push('zip_dir', zipDir(dist, options.zip));
    }

    return task.run();

};
