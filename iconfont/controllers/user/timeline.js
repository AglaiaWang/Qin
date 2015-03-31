var models = require("../../models");

module.exports.getData = function(req, res) {
	var user_id = req.session.userId;
	models.Icon.hasOne(models.QunarFont, {
		foreignKey: 'id'
	});
	models.Icon.findAndCountAll({
		where: "user_id = " + user_id,
		order: 'create_time DESC',
		attributes: ['id', 'name', 'create_time', 'isAddQFont'],
		include: [{
			model: models.QunarFont,
			attributes: ['code']	
		}]
	}).success(function(result) {
		res.json(result);
	}).error(function(err) {
		res.json({
			status: -500,
			message: "数据查询失败"
		});
		console.log("错误信息：" + err);
	});
}