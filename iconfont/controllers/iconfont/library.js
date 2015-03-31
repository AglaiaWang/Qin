var models = require("../../models");
var limit = 24; //24
var _options = {
	where: " isDone = 1 ",
	limit: limit,
	offset: 0,
	order: 'id ASC',
	include: [{
		model: models.QunarFont,
		attributes: ['code'],
	}]
};

module.exports.getPage = function(req, res) {
	var userId = req.session.userId,
		actor = req.session.actor;
	if (!!userId && actor > 0) {
		res.render('templates/materialLibrary', {
			limit: limit
		});
	} else {
		res.render("templates/404", {
			status: -1,
			message: "错误，权限不足或未登录"
		});
	}
}


module.exports.getLibrary = function(req, res) {
	var options = {};
	var type = req.query.type || '0'; //0代表请求所有数据，-1代表只显示字体库的图标，1表示只显示素材库的图标
	var search = req.query.search || '';
	extend(options, _options);
	options.offset = ((req.query.page || 1) - 1) * options.limit;
	switch (type) {
		case '-1':
			options.where += ' AND isAddQFont = 1 ';
			break;
		case '1':
			options.where += ' AND isAddQFont = 0 ';
			break;
		default:
			break;
	}
	if (search != '') {
		options.where += ' AND ( name LIKE "%' + search + '%" OR tags LIKE "%' + search + '%" ) ';
	}
	models.Icon.hasOne(models.QunarFont, {
		foreignKey: 'id'
	});
	models.Icon.findAndCountAll(options).then(function(result) {
		res.json(result);
	}).catch(function(err) {
		console.log(err);
	});
}

function extend(obj1, obj2) {
	for (var attr in obj2) {
		obj1[attr] = obj2[attr];
	}
}

module.exports.getIds = function(req, res) {
	models.Icon.findAll({
		where: {
			isAddQFont: 0,
			isDone: 1
		},
		attributes: ['id']
	}).then(function(result) {
		res.json(result);
	}).catch(function(err) {
		console.log(err);
	});
}