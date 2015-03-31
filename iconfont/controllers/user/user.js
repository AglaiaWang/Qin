/**
 * Created by zhinian.yang on 2015/1/1.
 */

var db=require('./../../models'),
    http=require('http');

// 用户登录

exports.login = function (req, res) {
    var token = req.body.token,
        forward = req.body.forward,
        body = "",userId;
        req.session= {};
    // 获取链接返回的数据
    http.get("http://qsso.corp.qunar.com/api/verifytoken.php?token="+token, function (resx) {
        resx.on('data',function(data){
            body += data;
        }).on('end', function () {
            var userInfo = JSON.parse(body);
            req.session= {};
            // 判断通过QSSO是否登陆成功
            if(userInfo.ret) {
                // 将用户信息保存入session ，用户rtx、userId、actor
                req.session.rtxName = userInfo.userId;
                req.session.nickName = userInfo.data.userInfo.name;
                req.session.actor = 0; // 默认情况下是普通权限
                // 在数据库中寻找相应的数据
                db.User.hasOne(db.Collection, {
                    foreignKey: 'user_id'
                });                             
                db.User.find({
                    where:{rtx:userInfo.userId},
                    // 获取用户的id、nickName、actor、total
                    attributes:['id','nickName','actor','total'],
                    include:[{
                        model: db.Collection,
                        attributes: ['id'],
                        where:"name = 'default'"
                    }]
                })
                .success(function (result) {
                    // result就是获取的属性对象
                    if(result!=null){//如果不为空，则进行赋值
                        req.session.userId = result.id;
                        req.session.actor = result.actor;
                        req.session.cid = result.dataValues.Collection.dataValues.id;
                        req.session.save();
                        res.redirect("/");
                    }else {//否则创建用户信息
                        db.User.create({
                            rtx: userInfo.userId,
                            nickName:userInfo.data.userInfo.name,
                            total: 0,
                            actor: 0
                        }).success(function (result) {
                            db.Collection.create({
                                name:"default",
                                user_id:result.dataValues.id,
                                total:0
                            }).success(function (data){
                                /* body... */
                                req.session.cid = data.dataValues.id;
                                req.session.userId = result.dataValues.id;
                                req.session.save();
                                res.redirect("/");
                            });
                        	
                        });

                    }
                    // 跳转到iconfont.qunar.com/
                })
            } else {
                res.send("登录失败!");
            }
        });
    }).on('error', function(e) {//报错
        console.log("错误：" + e.message);
        res.send("错误：" + e.message);
    });
};

// 用户登出
exports.logout = function (req, res) {
    // 将nickName、rtxName设置为null，将主页转变为非登陆状态
    req.session.nickName = null;
    req.session.rtxName = null;
    req.session.userId = null;
    req.session.actor = null;
    console.log("退出成功");
    res.redirect("/");
};

exports.getAllFonts = function(req, res) {
    var result = {};
    db.QunarFont.findAll({
        where: {
            // 取得所有的code信息
            id: {gt:0}
        },
        attributes: ["id","code"]
    }).success(function(fontsResult) {
        db.Icon.findAll({
            where:{
                id:{gt:0}
            },
            attributes:["name"]
        }).success(function(namesResult){
            result.fontsResult = fontsResult;
            result.namesResult = namesResult;
            console.log("fontsResult.length:"+fontsResult.length);
            res.json({
                status:200,
                total: result
            });
        }).error(function(err){
            console.log(err);
            res.json({
                status: 500,
                message:"素材库查询失败"
            });
        });
    }).error(function(err) {
        console.log(err);
        res.json({
            status: 500,
            message: "字体库查询失败"
        });
    });
};

// 后台分页获取数据
// exports.getData = function(req, res){
//     db.QunarFont.findAll({
//         where:{id:{lt:41}},
//         attributes:["code"]
//     }).success(function(result){
//         if(result!=null){
//             req.session.qunarFontLength = result.length;
//             for(var i=0;i<result.length;i++){
//                 req.session.qunarFont[i] = result[i].dataValues.code;
//             }
//         }
//         else{
//             console.log("NOT GET DATA!!");
//         }
//     });
// }

