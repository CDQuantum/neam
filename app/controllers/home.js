'use strict';
/**
 * Project: neam
 * Created by renwoxing on 16/2/13.
 * Name:
 * Desc:
 *
 * Copyright (c) xy  16/2/13
 */
var authService = require('../services/auth');

module.exports = {

    index:function(req,res,next){
        res.render('home/index');
    },
    list:function(req,res,next){
        var username="test_teacher_3";
        var pwd="123456";
        authService.getToken(username,pwd,function(data,err){
            //console.log("ok");
            if(err){
                next();
            }
            console.log(data.toString());
            res.render('home/list');

        });
    }

}