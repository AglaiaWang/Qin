/*
* @author missy missy.liu@qunar.com 2015-01-05 based on previous version
* 生成font、html、css、zip功能函数
*/
var builder = require('./lib/builder');
var builder2 = require('./lib/builder2');

module.exports = {
    main: function(source, dist, options) {

        return builder(source, dist, options || {});

    },
    fontOnly:function(source, dist, options) {

        return builder2(source, dist, options || {});

    }
};