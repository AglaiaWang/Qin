"use strict";
module.exports = function(sequelize, DataTypes) {
  var Group = sequelize.define('Group', {
    name : DataTypes.STRING,
    total : DataTypes.INTEGER,
    index_icon : DataTypes.INTEGER,
    display : DataTypes.INTEGER
  },{
    timestamps: false
  });
  return Group;
};