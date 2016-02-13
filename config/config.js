/**
 * Project: nerm-Bootstrap-Starter
 * Created by renwoxing on 16/2/7.
 * Name:  nerm-Bootstrap-Starter nerm 脚手架 加载配置文件
 * Desc:
 *    //nodejs api util  https://nodejs.org/api/util.html
 * Copyright (c) rener  16/2/7
 */
'use strict';

/**
 * Module dependencies.
 */

const path = require('path');
const extend = require('util')._extend;

//环境配置
const development = require('./env/development');  //开发
const test = require('./env/test');                //测试
const production = require('./env/production');    //生产

//消息推送配置
const notifier = {
    service: 'postmark',
    APN: false,
    email: true, // true
    tplPath: path.join(__dirname, '..', 'app/mailer/templates'),
    key: 'POSTMARK_KEY'
};

const defaults = {
    root: path.join(__dirname, '..'),
    notifier: notifier
};

/**
 * 声明环境配置文件数组
 * 根据process.env.NODE_ENV加载不同环境配置文件
 * extend
 */

module.exports = {
    development: extend(development, defaults),
    test: extend(test, defaults),
    production: extend(production, defaults)
}[process.env.NODE_ENV || 'development'];
