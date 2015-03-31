/**
 * Created by jianlong.yao on 2014/9/2.
 *@lastModify: 2015.01.05 by jie.pi 
 */
var db=require("../../models"),
    validate = require('./validate');

// 搜索图标
module.exports.searchByKey = function (req, res, keywords) {
    var msg = validate.keywordValid(keywords);
    if(msg === true) {
      var obj = {
            keywords    : keywords,
            attributes  : ['id', 'name', 'user_id'],
        },
        rtn = {
            status : 0,
            data : {
                list : []
            }
        };
        var whe = ["(name LIKE '%"+obj.keywords+"%' or tags LIKE '%"+obj.keywords+"%') AND isAddQFont=1"]
        if(keywords==="-all-true-"){
            whe = "isAddQFont=1";
        }
        db.Icon.findAll({
            where: whe,
            attributes: obj.attributes
        }).then(function(result) {
            var ids =[];
            for (var i = 0; i < result.length;i++) {
                ids.push(result[i].dataValues['id']);
               
                var o = {
                    _id: result[i].dataValues['id'],
                    _name: result[i].dataValues['name'],
                    owner: result[i].dataValues['user_id'] == req.session.userId ? true : false,
                }
                rtn.data.list.push(o);

            }

            db.QunarFont.findAll({where:{id:ids},attributes:['code']}).then(function(re){
                for (var i = 0; i < re.length;i++) {
                    rtn.data.list[i].fontCode = re[i].dataValues["code"];
                }
                res.json(rtn);
            }).catch(function(error) {
                var re = {status:-404,data:{list:['服务器忙，请稍后重试~~']}}
                res.json(re);
            });
        }).catch(function(error) {
            var re = {status:-404,data:{list:['服务器忙，请稍后重试~~']}}
                 res.json(re);
        });
    
    } else {
         var re = {status:-422,data:{list:['查询数据不合法，请重新输入~~']}}
             res.json(re);
    }
};

// 搜索建议
module.exports.suggest = function (req, res, keywords) {
    var msg = validate.keywordValid(keywords);
    if(msg === true) {
        var obj = {
            keywords    : keywords,
            attributes  : ['name'],
            pageSize    : 10,
            pageNum     : 1
        };

        db.Icon.findAll({
            order: 'collect_times DESC',
            where: ["(name LIKE '%"+obj.keywords+"%' or tags LIKE '%"+obj.keywords+"%') AND isAddQFont=1"],
            attributes: obj.attributes,
            offset: obj.pageSize*(obj.pageNum-1),
            limit: obj.pageSize
        }).success(function(result) {
            var rtn = {
                status: 0,
                data: {
                    list: []
                }
            };
            for(var i=0; i<result.length; i++) {
                rtn.data.list.push(result[i].name);
            }
            res.json(rtn);
        }).error(function (err) {
            res.json({stauts:-500, message: "查询错误"});
        });
    } else {
        res.json({status: -10, message: msg});
    }
};