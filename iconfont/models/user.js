"use strict";
module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
	rtx: DataTypes.STRING,
	nickName: DataTypes.STRING,
	total: DataTypes.INTEGER,
	actor: DataTypes.INTEGER,
	pwd: DataTypes.STRING
  },{
    timestamps: false
  });
  return User;
};