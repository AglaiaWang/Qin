"use strict";
module.exports = function(sequelize, DataTypes) {
  var Icon = sequelize.define("Icon", {
	user_id: DataTypes.INTEGER,
	name: DataTypes.STRING,
	tags: DataTypes.STRING,
	create_time: DataTypes.DATE,
	collect_times: DataTypes.STRING,
	download_times:DataTypes.STRING,
	apply_time:DataTypes.DATE,
	status:DataTypes.INTEGER
  },{
    timestamps: false
  });
  return Icon;
};