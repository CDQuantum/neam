'use strict';
/**
 * Module dependencies.
 */
//var validator = require('validator');
var logger = require('winston');
var authService = require('../services/auth');


/**
 * 声明
 */
module.exports = {

  load: function(req,res,next,_id){
    const criteria = _id ;
    req.profile = User.load(criteria);
    if (!req.profile) return next(new Error('User not found'));
    next();
  },

  /**
   * 登录
   */
  login: function(req, res, next) {
    var username = req.body.username;
    var password = req.body.password;
    var roleType = req.body.roleType;

    if(validator.isNull(username)){
      req.flash('error', '请填写用户名！');
      return res.render('index', {roleType : roleType});
    }
    if(validator.isNull(password)){
      req.flash('error', '请填写密码！');
      return res.render('index', {roleType : roleType});
    }
    authService.getToken(username, password, function(err, data) {
      if (err) {
        return next(err);
      }
      if(data.errcode){
        req.flash('error', '账号或密码错误！');
        return res.render('index', {roleType : roleType});
      }else{
        var access_token = data.access_token;
        var refresh_token = data.refresh_token;
        if(roleType === '1'){
          teacherService.getInfo(access_token, function(err, data) {
            if (err) {
              req.flash('error', err);
              return res.render('index', {roleType : roleType});
            }
            req.session.access_token = access_token;
            req.session.refresh_token = refresh_token;
            req.session.user = data;

            res.redirect('/teacher/home/index');
          });
        }else{
          schoolService.getInfo(access_token, function(err, data) {
            if (err) {
              req.flash('error', err);
              return res.render('index', {roleType : roleType});
            }
            req.session.access_token = access_token;
            req.session.refresh_token = refresh_token;
            req.session.user = data;

            res.redirect('/admin/teacher/list');
          });
        }
      }
    });
  },

  /**
   * 注销
   */
  logout: function(req, res, next) {
    delete req.session.user;
    delete req.session.access_token;
    delete req.session.refresh_token;
    res.redirect('/');
  }

};
