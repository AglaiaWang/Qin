"use strict";
module.exports = function(sequelize, DataTypes) {
  var Collect_qFont = sequelize.define("Collect_qFont", {
	collect_id: DataTypes.INTEGER,
	qFont_id: DataTypes.INTEGER
  },{
    timestamps: false
  });
  return Collect_qFont;
};
