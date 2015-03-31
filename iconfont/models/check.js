"use strict";
module.exports = function(sequelize, DataTypes) {
  var Check = sequelize.define("Check", {
  	icon_id:DataTypes.INTEGER,
  	check_user_id:DataTypes.INTEGER,
  	check_time:DataTypes.DATE,
  	status:DataTypes.INTEGER,
  	remarks:DataTypes.STRING
  },{
    timestamps: false
  });
  return Check;
};