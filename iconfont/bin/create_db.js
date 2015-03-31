#!/usr/bin/env node
// var db=require("../models"),
// 	json = require(__dirname + "/../config/initData.json"),
// 	fs = require("fs"),
// 	path = require("path");
function initDb(){
 	this.db = require("../models");
	this.json = require(__dirname + "/../config/initData.json");
	this.fs = require("fs");
	this.code = "";
	this.name = "";
	this.id = 1;
	this.svgPath = "";
	this.newSvgPath = "";
}
initDb.prototype.init = function(){
	for(key in this.json){
		this.svgPath = __dirname+"/../config/svg/"+key+".svg";
		this.newSvgPath = __dirname+"/../config/svg/"+this.id+".svg";
		this.code = this.json[key].code
		this.name = key;
		// this.rename();
		this.createDatas();
		this.id = this.id +1;
	}
}
initDb.prototype.rename = function(){
	this.fs.rename(this.svgPath,this.newSvgPath);
}
initDb.prototype.createDatas =function(){
	this.db.Icon.create({
		name:this.name,
		user_id:0,
		tags:this.name,
		create_time:new Date(),
		apply_time:new Date(),
		status:4
	})
	this.db.QunarFont.create({
		code:this.code,
		deleted:0
	})
}
var a = new initDb();
a.init();