/**
 * Project: nerm-Bootstrap-Starter
 * Created by renwoxing on 16/2/7.
 * Name: nerm-Bootstrap-Starter nerm 脚手架
 * Desc:
 *    nerm-Bootstrap-Starter nerm 脚手架 app 启动入口
 * Copyright (c) rener  16/2/7
 */


/**
 * Module dependencies
 */

var fs = require('fs');
var join = require('path').join;
var express = require('express');
var mongoose = require('mongoose');
var config = require('./config/config');

var models = join(__dirname, 'app/models');
var port = process.env.PORT || 3000;   //服务端口号
var app = express();

/**
 * 声明方法
 */

module.exports = app;

// models 导入
fs.readdirSync(models).filter(function (file) {
    return ~file.indexOf('.js');
}).forEach(function (file) {
    return require(join(models, file));
});

// routes 解析
require('./config/express')(app);
require('./config/routes')(app);

//mongoose 连接方法
connect()
    .on('error', console.log)
    .on('disconnected', connect)
    .once('open', listen);

function listen() {
    if (app.get('env') === 'test') return;
    app.listen(port);
    console.log("\n✔ NERM 已成功启动, 访问:http://localhost:%d , 处于 %s 模式.", port, app.get('env'));
}

function connect() {
    //console.log("\n  NERM DB start loading …… ");
    var options = { server: { socketOptions: { keepAlive: 1 } } };
    return mongoose.connect(config.db, options).connection;
}


// create a server instance
// passing in express app as a request event handler
/*app.listen(port, function() {
    console.log("\n✔ NERM 已成功启动,端口号: %d , 处于 %s 模式.", port, app.get('env'));
});*/
