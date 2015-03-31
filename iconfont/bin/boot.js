/**
*@author hjsen jinsen.huang@qunar.com
*@desc 
*	路由配置模块
*	"/" 用户浏览
*	"/api" 用户调用
* 	"/auth" 相关权限操作
*@startTime:2014.12.24
*@lastModify:2014.12.24  hjsen
*/

var fs = require('fs');
module.exports = function (parent) {
    if (!parent) {
        console.log('Express is not defined！');
        return;
    }
    fs.readdirSync(__dirname + "/../routes").forEach(function (name) {
        console.log(__dirname + '/../routes/' + name);
        require(__dirname + '/../routes/' + name)(parent);
    });
};
