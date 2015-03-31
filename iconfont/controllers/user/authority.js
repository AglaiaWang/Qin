/*
 * name: checkAuthority
 * param: req: express封装的http request
 *        res: express封装的http response
 *        actor: 进行操作必须大于的权限值, 0: 普通用户; 1: 普通管理员, 2: 超级管理员
 *        type: 请求的类型, "api"或"route"，决定向客户端返回response的类型(json, html)
 * description: 对于已登录用户，若低于权限值，返回404页，否则进行相应响应 
 */
function checkAuthority (req, res, actor, type) {
    //未登录用户
    if (!req.session.userId) {
        sendRes();
        return false;
    }
    if (req.session.actor < actor) {
        sendRes();
        return false;
    }
    function sendRes () {
        //默认不需要type
        if (type && type.toLowerCase() == "api") {
            res.json({status:-404, message: "错误，权限不足或未登录"});
        } else if (type && type.toLowerCase() == "route") {
            res.render("templates/404.ejs", {status:-404, message: "错误，权限不足或未登录"});
        } else {
            res.render("templates/404.ejs", {status:-404, message: "错误，权限不足或未登录"});
        }
    }
    return true;
}
module.exports = checkAuthority;