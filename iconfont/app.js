/*
*@author:hjsen
*@desc:the path of the Project
*@startTime:2014.12.24     
*@lastModify:2014.12.24    hjsen
*/
var express = require('express'),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express();
var cookieSession = require('cookie-session');

var server = require('http').Server(app)
module.exports.server = server;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieSession({
    keys: ['secret1', 'secret2']
}))
app.use(function (req, res, next){
  res.locals.session = req.session;
  next();
});
require('./bin/boot')(app);
server.listen(8880);
