"use strict";
var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var basename  = path.basename(module.filename);
var env       = process.env.NODE_ENV || "development";
var config    = require(__dirname + '/../config/config.json')[env];
var initDatas = require(__dirname + '/../config/initData.json');
var query = require("./../node_modules/sequelize/lib/dialects/mysql/query");
var Log = require('log');
var sequelize = new Sequelize(config.database, config.username, config.password, config);
var db        = {};

//数据库操作的日志记录

//日志文件夹不存在则新建
if ( !fs.existsSync(  path.join(__dirname, '/../log')   ) ){
    fs.mkdirSync(   path.join(__dirname, '/../log') )
}
var db_success = path.join(__dirname, '/../log/db_success.log'),
    db_error = path.join(__dirname, '/../log/db_error.log'),
    stream_db_success = fs.createWriteStream(db_success, {
        flags: 'a'
    }),
    stream_db_error = fs.createWriteStream(db_error, {
        flags: 'a'
    }),
    log_db_success = new Log('debug', stream_db_success),
    log_db_error = new Log('debug', stream_db_error),
    _run = query.prototype.run;

query.prototype.run = function(sql) {
    var rtn = _run.call(this, sql);
    rtn.success(function(){
        log_db_success.debug(sql);
    }).error(function(err) {
        log_db_error.error(err);
    });
    return rtn;
};

fs.readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== basename);
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });
Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

//config.buildDatabases == true,create the databases.
if(config.buildDatabases){ 
  sequelize.sync();
}
db.sequelize = sequelize;
db.Sequelize = Sequelize;
module.exports = db;
