"use strict";
module.exports = function(sequelize, DataTypes) {
  var User_group = sequelize.define('User_group', {
    user_id : DataTypes.INTEGER,
    gruop_id : DataTypes.INTEGER
  },{
    timestamps: false
  });
  return User_group;
};