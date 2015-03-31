/**
 * Created by dujuan.cao on 2014/12/30.
 * Temporary Collection / Favorite Group
 * For RE JS
 */

var db = require('./../../models');

/**
 * 保存临时收藏
 */
var saveTempCollection = function(req, res, user_id, cname, cid) {

	if (cname == null || typeof cname == undefined || cname == '') {
		res.json({
			status: -404,
			message: "数据格式不正确"
		});
		return;
	}
	console.log("in sava  ssssssssss");
	console.log(user_id,cname,cid);
	db.Collection.count({
		where: {
			name: cname,
			user_id: user_id
		}
	}).then(function(data) {
		console.log("after db ")
		if (data > 0) {
			saveToCollection(req, res, cname);
		} else {
			db.Collection.build({
				name: cname,
				user_id: user_id,
				total: 0
			}).save().then(function(msg) {
				// console.log("已新建收藏分组" + msg.dataValues['id']);
				var collect_id = msg.dataValues['id'];
				db.Collect_qFont.update({
					collect_id: collect_id
				}, {
					where: {
						collect_id: cid
					}
				}).then(function(data) {
					// console.log("已更新1" + data);
					db.Collect_qFont.count({
						where: {
							collect_id: collect_id
						}
					}).then(function(result) {
						db.Collection.update({
							total: result
						}, {
							where: {
								user_id: user_id,
								name: cname
							}
						}).then(function(result) {
							// console.log("已更新" + result);
						}).error(function(err) {
							res.json({status: -19, message: "更新失败"});
							// console.log("更新失败!" + err);
						});
					});
				}).error(function(err) {
					res.json({status: -20, message: "更新失败"});
					// console.log("更新失败!" + err);
				});

				db.Collection.update({
					total: 0
				}, {
					where: {
						user_id: user_id,
						name: 'default'
					}
				}).then(function(data) {
					// console.log("已更新" + data);
				}).error(function(err) {
					res.json({status: -21, message: "更新失败"});
					// console.log("更新失败!" + err);
				});
			});
		}
	});
	res.json([]);
};

/**
 * 添加到已有的收藏中
 */
var saveToCollection = function(req, res, user_id, cname, cid) {
	if (cname == null || typeof cname == 'undefined' || cname == '') {
		res.json({
			status: -404,
			message: "数据格式不正确"
		});
		return;
	}

	db.Collection.find({
		where: {
			name: cname,
			user_id: user_id
		},
		attributes: ['id']
	}).then(function(result) {
		if (result == null) {
			res.json({
				status: -404,
				message: "未找到对应收藏"
			});
			return;
		}

		var collect_id = result.dataValues['id'];
		db.Collect_qFont.update({
			collect_id: collect_id
		}, {
			where: {
				collect_id: cid
			}
		}).then(function(data) {
			// console.log("已更新1" + data);
			db.Collect_qFont.count({
				where: {
					collect_id: collect_id
				}
			}).then(function(result) {
				db.Collection.update({
					total: result
				}, {
					where: {
						user_id: user_id,
						name: cname
					}
				}).then(function() {
					// console.log("已更新" + result);
				}).error(function(err) {
					res.json({status: -22, message: "更新失败"});
					// console.log("更新失败!" + err);
				});
			});
		});
		db.Collection.update({
			total: 0
		}, {
			where: {
				user_id: user_id,
				name: 'default'
			}
		}).then(function(data) {
			// console.log("已更新" + data);
		}).error(function(err) {
			res.json({status: -23, message: "更新失败"});
			// console.log("更新失败!" + err);
		});
	});
	res.json([]);
};

/**
 * 查找用户的临时搜藏
 */
var findTemp = function(req, res, cid) {
	var tempCollects = [];
	//个数处理，在查询处去除，添加到各个增删处理部分。todo
	//只做查询
	db.Collect_qFont.belongsTo(db.QunarFont, {
		foreignKey: 'qFont_id'
	});
	db.Collect_qFont.findAll({
		where: 'collect_id = ' + cid,
		include: [{
			model: db.QunarFont,
			attributes: ['code']
		}],
		attributes: ['qFont_id']
	}).success(function(result) {
		if (result != null && result != "") {
			for (var i = 0, len = result.length; i < len; i++) {
				tempCollects.push({
					id: result[i].dataValues['qFont_id'],
					code: "&#x" + result[i].dataValues['QunarFont'].dataValues['code'] + ";"
				});
			}
			updateCount({
				where:' id = '+cid
			});
			res.json(tempCollects);
		}
	}).error(function(err) {
		/* Act on the event */
		console.log("查找失败!" + err);
		res.json(tempCollects);
	});
}

/**
 * 查找收藏分组图标
 */
var getCollectFont = function(req, res, cid, name, gName, gList) {
	var fontList = {
			name: name,
			fonts: [],
			gList: gList
		},
		fontList1 = {
			name: name,
			fonts: [],
			gList: gList
		},
		ids = [],
		collect_id = cid;
	db.Collect_qFont.findAll({
		where: "collect_id = " + collect_id,
		attributes: ['qFont_id']
	}).then(function(result) {
		if (result != null && result != "") {
			for (var i = 0, len = result.length; i < len; i++)
				ids.push(result[i].dataValues['qFont_id']);
			db.QunarFont.findAll({
				where: {
					id: ids
				},
				attributes: ['id', 'code']
			}).then(function(result) {
				if (result != null && result != "") {
					var qfonts = [];
					for (var i = 0, len = result.length; i < len; i++) {
						qfonts.push({
							q_ds: result[i].dataValues['id'],
							q_code: result[i].dataValues['code']
						});
					}

					db.Icon.findAll({
						where: {
							id: ids
						},
						attributes: ['id', 'name']
					}).then(function(ret) {
						var icons = [];
						for (var j in ret) {
							var i_id = ret[j].dataValues['id'];
							var i_name = ret[j].dataValues['name'];
							for (var i in qfonts) {
								if (i_id == qfonts[i].q_ds) {
									fontList.fonts.push({
										id: i_id,
										name: i_name,
										code: qfonts[i].q_code
									});
									fontList1.fonts.push({
										id: i_id,
										name: i_name,
										code: "&#x" + qfonts[i].q_code + ";"
									});
								}
							}
						}
						if (gName === '' || gName === null) {
							res.render("templates/collection", {
								fontList: fontList
							});
						} else {
							res.json(fontList1);
						}
					}).error(function(err) {
						res.json({status: -17, message: "查找失败"});
						// console.log("查找失败!" + err);
					});
				}
			});
		} else {
			if (gName === '' || gName === null) {
				res.render("templates/collection", {
					fontList: fontList
				});
			} else {
				res.json(fontList1);
			}
		}
	}).error(function(err) {
		res.json({status: -18, message: "查找失败"});
		// console.log("查找失败!" + err);
	});
}

/**
 * 清空临时收藏
 */
var clearTempCollect = function(req, res, user_id, cname) {
	db.Collection.find({
		where: "user_id = " + user_id + " and name = '" + cname + "'",
		attributes: ['id']
	}).then(function(result) {
		var cid = result.dataValues['id'];
		db.Collect_qFont.destroy({
			where: {
				collect_id: cid
			}
		}).then(function(result) {
			// findTemp(req, res, cid);
			res.json([]);
		}).error(function(err) {
			res.json({status: -1, message: "删除失败"});
			// console.log("删除失败!" + err);
		});
	});
}

/**
 * 操作临时收藏
 */
module.exports.tempCollect = function(req, res, icon, deal, cname) {
	var user_id = req.session.userId;
	var cid = req.session.cid;//默认收藏id
	var name = cname;
	switch(deal){
		case 'query':
			findTemp(req, res, cid);
			break;
		case 'add':
			db.Collect_qFont.create({
				collect_id: cid,
				qFont_id: icon
			}).then(function(result) {
				
				findTemp(req, res, cid);
			}).error(function(err) {
				res.json({status: -2, message: "添加失败"});
				//console.log("添加失败!" + err);
			});
			break;
		case 'del':
			db.Collect_qFont.destroy({
				where: {
					collect_id: cid,
					qFont_id: icon
				}
			}).then(function(result) {
				
				findTemp(req, res, cid);
			}).error(function(err) {
				res.json({status: -3, message: "删除失败"});
				// console.log("删除失败!" + err);
			});
			break;
		case 'save':
			saveTempCollection(req, res, user_id, name, cid);
			break;
		case 'saveTo':
			saveToCollection(req, res, user_id, name, cid);
			break;
		case 'clear':
			clearTempCollect(req, res, user_id, 'default');
			break;
		default:
			console.dir('不期待的处理命令：['+deal+']');
			break;
	}
}





/**
 * 获取当前用户收藏名,如果未登陆，则获取localstorage加载临时收藏数据
 */
module.exports.getCollection = function(req, res, gName, cname) {

	var user_id = req.session.userId,
		name = '',
		cList = [],
		gList = [];
	if(user_id != null ) {
		if (gName === null || gName === "") {
			if (cname === undefined)
				name = 'default';
			else {
				name = cname;
			}
		} else {
			name = gName;
		}
		db.Collection.findAll({
			where: "user_id = " + user_id,
			attributes: ['id', 'name']
		}).then(function(result) {
			if (result != null && result != "") {
				for (var i = 0, len = result.length; i < len; i++) {
					gList.push({
						id: result[i].dataValues['id'],
						name: result[i].dataValues['name']
					});
				}
			}

			db.Collection.find({
				where: "user_id = " + user_id + " and name = '" + name + "'",
				attributes: ['id', 'total']
			}).then(function(result) {
				if (result != null && result != "") {
					var id = result.dataValues['id'];
					var total = result.dataValues['total'];
					if(req.query.id != null && req.query.id != undefined){
						id = req.query.id;
					}
					getCollectFont(req, res, id, name, gName, gList);
				}
			}).error(function(err) {
				res.json({status: -5, message: "查找失败"});
				// console.log("查找失败!" + err);
			});
		}).error(function(err) {
			res.json({status: -6, message: "查找失败"});
			// console.log("查找失败!" + err);
		});
	}else {
		res.render("404.ejs", {status:-1, message: "错误，权限不足或未登录"});
	}
}

/**
 * 查找除了临时分组以外的所有组名
 */
module.exports.queryCollectGroup = function(req, res) {
	var user_id = req.session.userId,
		gList = [];
	db.Collection.findAll({
		where: "user_id = " + user_id,
		attributes: ['id', 'name']
	}).then(function(result) {
		if (result != null && result != "") {
			for (var i = 0, len = result.length; i < len; i++) {
				if (result[i].dataValues['name'] !== "default")
					gList.push({
						id: result[i].dataValues['id'],
						name: result[i].dataValues['name']
					});
			}
		}
		res.json(gList);
	}).error(function(err) {
		res.json({status: -7, message: "查找失败"});
		// console.log("查找失败!" + err);
	});
}

/**
 * 修改收藏分组名
 */
module.exports.editCollectGroup = function(req, res, oldName, newName) {
	var user_id = req.session.userId;
	if (oldName !== newName && user_id) {
		db.Collection.update({
			name: newName
		}, {
			where: {
				user_id: user_id,
				name: oldName
			}
		}).then(function(data) {
			res.json([]);
		}).error(function(err) {
			res.json({status: -8, message: "更新失败"});
			// console.log("更新失败!" + err);
		});
	} else {
		res.json([]);
	}
}

/**
 * 删除分组
 */
module.exports.deleteCollectGroup = function(req, res, gName) {
	var id = req.query.id;
	var user_id = req.session.userId;
	db.Collect_qFont.destroy({
			where: {
				collect_id: id
			}
		}).then(function() {
			res.json([]);
			// console.log("删除成功！");
		}).error(function(err) {
			res.json({status: -9, message: "删除失败"});
			// console.log("删除失败!" + err);
		});

		db.Collection.destroy({
			where: {
				user_id: user_id,
				id: id
			}
		}).then(function() {
			// console.log("删除成功！");
		}).error(function(err) {
			res.json({status: -10, message: "删除失败"});
			// console.log("删除失败!" + err);
		});
}

/**
 * 删除已选的收藏图标
 */
module.exports.deleteIconCo = function(req, res, gName, ids) {
	var user_id = req.session.userId;
	db.Collection.find({
		where: {
			user_id: user_id,
			name: gName
		},
		dataValues: ['id']
	}).then(function(result) {
		var cid = result.dataValues['id'];
		db.Collect_qFont.destroy({
			where: {
				qFont_id: ids,
				collect_id: cid
			}
		}).then(function() {
			// console.log("删除收藏组里指定的图标成功！");
			getCollectFont(req, res, cid, gName, gName, []);
		}).error(function(err) {
			res.json({status: -12, message: "查找失败"});
			// console.log("查找失败!" + err);
		});
	}).error(function(err) {
		res.json({status: -13, message: "查找失败"});
		// console.log("查找失败!" + err);
	});;
}

function updateCount(options) {
	var where  = options.where;
	var sql = ['UPDATE Collections SET total = (',
		'SELECT COUNT(id) FROM Collect_qFonts WHERE ' + where + ' )',
		'WHERE ' + where
	].join(' ');
	db.sequelize.query(sql)
	.then(function (argument){
		/* body... */
	})
	.error(function(err) {
		console.log('同步图标收藏失败');
	});
}