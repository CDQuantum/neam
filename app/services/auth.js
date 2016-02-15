/**
 * Project: neam
 * Created by renwoxing on 16/2/13.
 * Name:
 * Desc:
 *
 * Copyright (c) xy  16/2/13
 */

'use strict';
var apis=require('../../config/apis');
var Client=require('../utils/api-client').Client;

module.exports = {
    /**
     * 获取token
     */
    getToken: function(username, password, callback) {
        var paras = {
            username:username,
            password:password,
            client_id:apis.client_global.client_id,
            redirect_uri:apis.client_global.redirect_uri,
            grant_type:apis.client_global.grant_type
        };
        var args={data: paras};
        var client = new Client();
        client.post(apis.access_token_url, args, function (data, res) {
            // parsed response body as js object
            console.log(data);
            // raw response
            //console.log(res);
            return callback(data, null);
        }).on('error', function (err) {
            console.log('something went wrong on the request', err.request.options);
            return callback(null, err);
        });

    }
};