"use strict";
module.exports = function(sequelize, DataTypes) {
  var QunarFont = sequelize.define("QunarFont", {
	code: DataTypes.STRING,
	deleted: DataTypes.BOOLEAN
  },{
    timestamps: false
  });
  return QunarFont;
};