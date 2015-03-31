/*
*@author: yyy.liu@qunar.com, based on previous version
*@desc: deal with upload icons. 
*@startTime: 2015.01.02
*@lastModify: 2015.01.08 by yyy.liu@qunar.com
*/
var db = require('./../../models');

//Parse http requests with content-type multipart/form-data, also known as file uploads.
var multiparty = require('multiparty'),
    fs = require('fs'),
    path = require('path');

//基于WebSocket协议与浏览器实现实时通信, 传递上传进度数据
var io = require('socket.io')(require('../../app').server),
	socketExposed;

io.on("connection", function (socket) {
	socketExposed = socket;
});

// SVG文件上传
module.exports.postFiles = function (req, res){
	var directory = path.join(__dirname, '/../../public/svg/'),  //SVG文件存储路径
		userId = req.session.userId,
		fileForm = new multiparty.Form({
            uploadDir: directory,
            encoding: 'utf-8',
            maxFilesSize: 20*1024*1024
        });

    initFileForm(req, res, userId, directory, fileForm);
};

//编辑上传图标信息
module.exports.uploadDeal = function(req, res){
	var userId = req.session.userId,
		actor = req.session.actor;

	var data = [];
	
	db.sequelize.query("SELECT b.id, b.name, b.tags, (SELECT COUNT(name) FROM Icons a WHERE a.name=b.name) as dup FROM Icons b WHERE b.isDone=0")
		.then(function (result) {
			data = result;
			if(result == null || result == '') {
        		res.render("templates/404.ejs", {status: -1, message: "当前用户没有待编辑的图标"})
            } else{
	            for(var i = 0, length = result.length; i < length; i++){
	            	if (result[i]["tags"].trim().length > 0) {
	        			data[i].tags = result[i]["tags"].trim().split(" ");
	        		} else {
	        			data[i].tags = [];
	        		}
	            }
				data = { data: data };
	        	res.render("templates/uploadDeal", data);
        	}
		}).catch(function (error) {
			res.json({status: -2, message: "数据查询出错"});
		});
};

//删除还未加入字体库的素材(isDone == 0)
module.exports.delFromLibrary = function(req, res) {
	var userId = req.session.userId;
	var id = req.body.id;
	var directory = path.join(__dirname, '/../../public/svg/');

	// if (!! userId) {
		db.Icon.find({
			where: {id: id}
		}).then(function(result) {
			//删除
			result.destroy().then(function (result) {
				//将服务器本地SVG文件删除
				deleteFromDirectory(id + ".svg", directory);
				
				res.json({status:0, message: "删除成功"});
			}).catch(function (err) {
				res.json({status:-2, message: "删除失败，请重试"});
			})
		}).catch(function (err) {
			res.json({status:-2, message: "数据库查询失败"})
		})
	// } else {
	// 	res.render("templates/404.ejs", {status:-1, message: "错误，权限不足或未登录"});
	// }
};

//图标名称查重
module.exports.checkDuplicate = function(req, res) {
	var userId  = req.session.userId;

	var id = req.query.id,
		iconname = req.query.name;

	if (!!userId) {
		checkDupIconNameFromDB(iconname, id, res);
	}
};

//接收完成编辑的信息
module.exports.completeUpload = function(req, res) {
	var userId  = req.session.userId;

	if (!!userId) {
		//解决上传数组中只有一个元素时，不会以数组的形式出现的问题
		if (Object.prototype.toString.apply(req.body["data[]"]).indexOf("Array") == -1) {
			req.body["data[]"] = new Array(req.body["data[]"]);
		}
		var idQuery = req.body["data[]"];
		db.Icon.update({
			isDone: 1
		}, {
			where: {id: idQuery}
		}).then(function (result) {
			res.json({status:0, message: "上传到素材库成功, 可以转换为字体"});
		}).catch(function (err){
			res.json({status: -2, message: "数据库查询出错"})
		});
	}else {
		res.json({status:-1, message: "请先登录"});
	}
};

function initFileForm (req, res, userId, directory, f) {
	f.parse(req, function (err, fields, files) {
        if(files == null || files == {}) {
            res.json({status:-404, message: "未接收到文件"});
            return ;
        }
        if(err) {
            res.json({status:-60, message: "上传文件失败"});
            throw err;
        } else {
            res.json({status: 1, data: {href: '/uploadDeal'}});
        }
    });

    //上传进度, 需要socket.io
    f.on('progress', function (bytesReceived, bytesExpected) {
        var ret = (bytesReceived / bytesExpected * 100).toFixed(2);
        socketExposed.emit("myprogress", {data: ret})
    });

	f.on('file', function (name, file) {
		//保留，以后可能支持ai等更多上传格式(不清楚需求)
        var arrExt = file.originalFilename.split('.'),
            ext = arrExt[arrExt.length-1];
        var filename = arrExt[0].replace(/\s/gm, ""),
        	UTC = new Date(),
        	localTime;
        
        localTime = UTC.getTime() - UTC.getTimezoneOffset() * 60000;  //SQL Icons表create_time字段值问题
        
        db.Icon.create({user_id : userId, name: filename, tags: filename, create_time: localTime, isDone: 0, isAddQFont: 0})
        	.then(function (result) {
	            var curId = result.dataValues.id //|| result['null'];
	            //将素材重命名
	            fs.rename(file.path, directory + "/" + curId + "." + ext, function () {
	                db.sequelize.query("UPDATE Users SET total = total+1 WHERE id = "+ userId)
	                	.catch(function (err) {
	                    	res.json({status: -2, message: "数据修改出错"});
	                	});
	            });
	        }).catch(function (err) {
	            res.json({status: -2, message: "上传失败"});
	        });
	});
};

function deleteFromDirectory (filename, directory) {
	//将服务器本地SVG文件删除
	fs.exists(directory + filename, function (exists) {
		fs.unlinkSync(directory + filename)
	});
}

function checkDupIconNameFromDB (iconname, id, res) {
	console.log("SELECT COUNT(id) as dupTimes FROM Icons WHERE name = '" + iconname + "' AND id != " + id)
	db.sequelize.query("SELECT COUNT(id) as dupTimes FROM Icons WHERE name = '" + iconname + "' AND id != " + id)
		.then(function (result) {
			if (result[0].dupTimes > 0) {
				res.json({status:1});
			} else {  //name不重复则直接修改数据库
       			db.sequelize.query("UPDATE Icons SET name = '" + iconname + "' WHERE id=" + id)
	       			.then(function (result) {
	      				res.json({status : 0, message : "修改成功"});
			   		}).catch(function(error){
			        	res.json({status: -500, message: "修改失败, 请重试"});
			    	});
       		}
		});
};
