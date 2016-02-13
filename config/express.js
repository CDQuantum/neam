'use strict';

/**
 * Module dependencies.
 */

const express = require('express');
const session = require('express-session');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const csrf = require('csurf');
const multer = require('multer');
const hbs = require('hbs');
const helmet = require('helmet');
const mongoStore = require('connect-mongo')(session);
const flash = require('connect-flash');
const winston = require('winston');
const helpers = require('view-helpers');
const config = require('./config');
const pkg = require('../package.json');
const rh=require('../app/middlewares/registerHelper');

const env = process.env.NODE_ENV || 'development';


/**
 * 声明
 */

module.exports = function (app) {

    // Compression middleware (should be placed before express.static)
    // 压缩中间件
    app.use(compression({
        threshold: 512
    }));

    // Static files middleware
    // 静态文件路径
    app.use(express.static(config.root + '/public'));

    // Use winston on production
    // 生产环境使用  winston 日志记录
    var log = 'dev';
    if (env !== 'development') {
        log = {
            stream: {
                write: function write(message) {
                    return winston.info(message);
                }
            }
        };
    }


    // Don't log during tests
    // Logging middleware
    if (env !== 'test') app.use(morgan(log));



    // set views path, template engine and default layout
    // view engine setup
    app.set('views', config.root + '/app/views');
    /**** 指定模板文件的后缀名为html  ****/
    app.set('view engine', 'html');
    // 运行hbs模块
    app.engine('html', hbs.__express);
    /**** 指定模板文件的后缀名为html end ****/

    /**********设置hbs 母模版文件位置************/
    hbs.registerPartials(config.root + '/app/views/includes');
    /**********设置hbs 子模版 END************/
    hbs.registerHelper("compare",rh.compare);
    hbs.registerHelper("equal",rh.equal);
    hbs.registerHelper('block',rh.block);
    hbs.registerHelper('extend',rh.extend);
    //console.log(config.root + '/app/views/includes')



    /********************** 安全设置部分 *********************/
    app.use(helmet());  //helmet包含九个安全中件间 csp hidePoweredBy hpkp hsts ieNoOpen noCache noSniff frameguard xssFilter
    /*********************** 安全设置部分 end  ****************/

    // 声明 package.json to views
    app.use(function (req, res, next) {
        res.locals.pkg = pkg;
        res.locals.env = env;
        next();
    });

    // bodyParser should be above methodOverride
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    //上传处理
    app.use(multer().array('image', 1));
    app.use(methodOverride(function (req) {
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            var method = req.body._method;
            delete req.body._method;
            return method;
        }
    }));

    // CookieParser should be above session
    app.use(cookieParser());
    app.use(cookieSession({secret: 'secret'}));
    app.use(session({
        resave: true,
        saveUninitialized: true,
        secret: pkg.name,
        store: new mongoStore({
            url: config.db,
            collection: 'sessions'
        })
    }));




    // connect flash for flash messages - should be declared after sessions
    app.use(flash());

    // should be declared after session and flash
    app.use(helpers(pkg.name));

    if (env !== 'test') {
        app.use(csrf());

        // This could be moved to view-helpers :-)
        app.use(function (req, res, next) {
            res.locals.csrf_token = req.csrfToken();
            next();
        });
    }
};
