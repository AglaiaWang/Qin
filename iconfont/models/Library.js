"use strict";
module.exports = function(sequelize, DataTypes) {
  var Library = sequelize.define("Library", {
	group_id: DataTypes.INTEGER,
	qunarFont_id: DataTypes.INTEGER
  },{
    timestamps: false
  });
  return Library;
};