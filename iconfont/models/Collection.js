"use strict";
module.exports = function(sequelize, DataTypes) {
  var Collection = sequelize.define("Collection", {
	name: DataTypes.STRING,
	user_id: DataTypes.INTEGER,
	total:DataTypes.INTEGER
  },{
    timestamps: false
  });
  return Collection;
};