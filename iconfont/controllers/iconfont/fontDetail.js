/**
 * Created by jianlong.yao on 2014/9/12.
 * Modified by jie.pi on 2014/12/30.
 */
var db = require('./../../models');

// 图标详情
module.exports.getIconDetail = function (req, res, id) {
    if(isNaN(id)) {
        res.json({status: -404, message: "数据格式不正确"});
        return;
    }
    var rtn = {
         status: 0,
         data: {
         }
    };
    db.QunarFont.find({where:{id:id},attributes:['code']}).success(function(re){
        rtn['data']['code'] = re.code;
        db.Icon.find({
            where:{
                id:id
            },
            attributes:['id','name','tags','create_time']
        }).success(function(result){
            if (result == null) {
                res.json({status: 0, data: null});
                res.end();
                return;
            }
            rtn["data"]["id"] = result.id;
            rtn["data"]["name"] = result.name;
            rtn["data"]["tags"] = result.tags;
            rtn["data"]["create_time"] = result.dataValues.create_time;
            res.json(rtn);
        }).error(function(err) {
            res.json({status:-500, message: "数据查询失败"});
        });
    }).error(function(err) {
        res.json({status:-500, message: "数据查询失败"});
    });
    
};

// 添加标签
module.exports.addTag = function (req, res, obj) {
    var id = obj.id,
        tag = obj.tag;

    db.Icon.find({where:{id:id},attributes:['tags']}).success(function(result){
    	var tags = result.tags == null ? '' : result.tags.split(/\s+/);
       
        for(var i=0,len=tags.length;i<len;i++)
            if(tags[i] == tag) break;

    	if(i!=len){
    		res.json({status: -32, message: "该标签已存在"});
            res.end();
    		return;
    	}

    	var newTags = result.tags == null ? tag : result.tags+' '+tag;
    	if(newTags.length>2000)
            res.json({status:-33,msg:'无法再添加标签'});
    	else db.Icon.update({tags:newTags},{where:{id:id}}).success(function(result){
    		res.json({
    		   status : 0,
    		   data : {}
    		});
    	}).error(function(error){
            console.log(error);
            res.json({status: -500, message: "数据查询失败"});
        });
    }).error(function(error){
        console.log(error);
        res.json({status: -500, message: "数据查询失败"});
    });
};

// 删除标签
module.exports.deleteTag = function (req, res, obj) {
    var id = obj.id,
        tag = obj.tag;
    db.Icon.find({where:{id:id},attributes:['tags']}).success(function(result){
    	var tags = result.tags ==null ? '' : result.tags.split(/\s+/);
    	for(var i=0,len=tags.length;i<len;i++){
    		if(tags[i]==tag){
    			tags.splice(i,1);
    			break;
    		}
    	}
    	var str = tags.join(' ');
    	db.Icon.update({tags:str},{where:{id:id}}).success(function(result){
             res.json({
                 status: 0,
                 data: {}
             })
    	}).error(function(error){
            console.log(error);
            res.json({status: -500, message: "数据库查询失败"});
    	})
    }).error(function(error){
        console.log(error);
        res.json({status: -500, message: "数据库查询失败"});
    })
};