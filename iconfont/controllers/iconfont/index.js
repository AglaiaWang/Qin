var models = require("../../models");
module.exports.getPage = function(req,res){
	models.User.findAll({
		attributes: ['rtx']
	}).then(function(datas){
		res.render("templates/index",{name:datas});
	}).catch(function(err) {
    	console.log(err);
  	});
}