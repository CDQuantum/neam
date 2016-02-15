/**
 * Project: neam
 * Created by renwoxing on 16/2/13.
 * Name:
 * Desc:
 *
 * Copyright (c) xy  16/2/13
 */
'use strict';
var http = require('http'),
    https = require('https'),
    urlParser = require('url'),
    util = require("util"),
    events = require("events"),
    querystring = require('querystring'),
    zlib = require("zlib"),
    crypto = require('crypto'),
    uuid = require('node-uuid'),
    apis=require('../../config/apis');

exports.Client = function (options) {
    var self = this;

    self.options = options || {},
        self.connection = self.options.connection || {},
        self.mimetypes = self.options.mimetypes || {};
    self.requestConfig = self.options.requestConfig || {};
    self.responseConfig = self.options.responseConfig || {};

    this.methods = {};


    // Client Request to be passed to ConnectManager and returned
    // for each REST method invocation
    // 定义一个 ClientRequest 类 继承 events.EventEmitter 观察者模式
    var ClientRequest = function () {
        events.EventEmitter.call(this);
    };

    //继承
    util.inherits(ClientRequest, events.EventEmitter);


    ClientRequest.prototype.end = function () {
        if (this._httpRequest) {
            this._httpRequest.end();
        }
    };

    ClientRequest.prototype.setHttpRequest = function (req) {
        this._httpRequest = req;
    };

    var ServiceUtil = {
            createConnectOptions: function (connectURL, connectMethod) {
                debug("connect URL = ", connectURL);
                var url = urlParser.parse(connectURL),
                    path,
                    result = {},
                    protocol = url.protocol.indexOf(":") == -1 ? url.protocol : url.protocol.substring(0, url.protocol.indexOf(":")),
                    defaultPort = protocol === 'http' ? 80 : 443;

                result = {
                    host: url.host.indexOf(":") == -1 ? url.host : url.host.substring(0, url.host.indexOf(":")),
                    port: url.port === undefined ? defaultPort : url.port,
                    path: url.path,
                    protocol: protocol
                };

                //if (self.useProxy) result.agent = false; // cannot use default agent in proxy mode

                if (self.options.user && self.options.password) {
                    result.auth = [self.options.user, self.options.password].join(":");

                } else if (self.options.user && !self.options.password) {
                    // some sites only needs user with no password to authenticate
                    result.auth = self.options.user;
                }


                if (self.connection && typeof self.connection === 'object') {
                    for (var option in self.connection) {
                        result[option] = self.connection[option];
                    }
                }

                // don't use tunnel to connect to proxy, direct request
                // and delete proxy options
                /*if (!self.useProxyTunnel){
                 for (option in result.proxy){
                 result[option] = result.proxy[option];
                 }

                 delete result.proxy;
                 }*/

                // add general request and response config to connect options

                result.requestConfig = self.requestConfig;
                result.responseConfig = self.responseConfig;


                return result;
            },
            accessTokenSign:function(paras) {
                paras.client_id = apis.client_global.client_id;
                paras.noncestr = uuid.v1();
                var sortKey = Object.keys(paras).sort();
                var sign = "";
                for (var i=0;i<sortKey.length ; i++){
                    if (sortKey[i] !== apis.sign_const.ACCESS_TOKEN && sortKey[i] !== apis.sign_const.SIGNATURE){
                        sign += paras[sortKey[i]];
                    }
                }
                sign += apis.client_global.secret;
                var md5 = crypto.createHash('md5');
                var signature = md5.update(sign).digest('hex');
                debug(' sign 签名值为:',signature);
                paras.signature = signature;
                return paras;
            },
            decodeQueryFromURL: function (connectURL) {
                var url = urlParser.parse(connectURL),
                    query = url.query.substring(1).split("&"),
                    keyValue,
                    result = {};

                // create decoded args from key value elements in query+
                for (var i = 0; i < query.length; i++) {
                    keyValue = query[i].split("=");
                    result[keyValue[0]] = decodeURIComponent(keyValue[1]);
                }

                return result;

            },
            encodeQueryFromArgs: function (args) {
                var result = "?", counter = 1;
                // create enconded URL from args
                for (var key in args) {
                    var keyValue = "";
                    if (args[key] instanceof Array) {
                        /*
                         * We are dealing with an array in the query string  ?key=Value0&key=Value1
                         * That a REST application translates into key=[Value0, Value1]
                         */
                        for (var ii = 0, sizeArray = args[key].length; ii < sizeArray; ii++) {
                            result = result.concat((counter > 1 ? "&" : "") + key + "=" + encodeURIComponent(args[key][ii]));
                            counter++;
                        }
                    } else { //No array, just a single &key=value
                        keyValue = key + "=" + encodeURIComponent(args[key]);
                        result = result.concat((counter > 1 ? "&" : "") + keyValue);
                    }

                    counter++;
                }

                return result;
            },
            parsePathParameters: function (args, url) {
                var result = url;
                if (!args || !args.path) return url;

                for (var placeholder in args.path) {
                    var regex = new RegExp("\\$\\{" + placeholder + "\\}", "i");
                    result = result.replace(regex, args.path[placeholder]);

                }

                return result;

            },
            overrideClientConfig: function (connectOptions, methodOptions) {
                function validateReqResOptions(reqResOption) {
                    return (reqResOption && typeof reqResOption === 'object');
                }

                // check if we have particular request or response config set on this method invocation
                // and override general request/response config
                if (validateReqResOptions(methodOptions.requestConfig)) {
                    util._extend(connectOptions.requestConfig, methodOptions.requestConfig);
                }

                if (validateReqResOptions(methodOptions.responseConfig)) {
                    util._extend(connectOptions.responseConfig, methodOptions.responseConfig);
                }


            },
            connect: function (method, url, args, callback, clientRequest) {
                //args.data  请求数据  args.headers 请求头
                // configure connect options based on url parameter parse
                var options = this.createConnectOptions(this.parsePathParameters(args, url), method);
                debug("options pre connect", options);
                options.method = method,
                    options.clientRequest = clientRequest,
                    options.headers = options.headers || {};

                debug("args = ", args);
                debug("args.data = ", args !== undefined ? args.data : undefined);
                // no args passed
                if (typeof args === 'function') {
                    callback = args;
                    //add Content-length to POST/PUT/DELETE/PATCH methods
                    if (method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH') {
                        options.headers['Content-Length'] = 0;
                    }
                } else if (typeof args === 'object') {
                    // add headers and POST/PUT/DELETE/PATCH data to connect options to be passed
                    // with request, but without deleting other headers like non-tunnel proxy headers
                    if (args.headers) {
                        for (var headerName in args.headers) {
                            options.headers[headerName] = args.headers[headerName];
                        }
                    }

                    //always set Content-length header
                    //set Content lentgh for some servers to work (nginx, apache)
                    if (args.data !== undefined) {
                        //access_token 处理
                        for (var dataItem in args.data) {
                              if(args.data[dataItem]===apis.sign_const.ACCESS_TOKEN){
                                  args.data=this.accessTokenSign(args.data);
                                  debug(" accessToken sign:",args.data);
                              }
                        }
                        options.data = args.data;
                        //options.headers['Content-Length'] = Buffer.byteLength((typeof args.data === 'string' ? args.data : JSON.stringify(args.data)), 'utf8');
                        options.headers['Content-Length'] = querystring.stringify(args.data).length;
                    } else {
                        options.headers['Content-Length'] = 0;
                    }

                    // 'Content-Type': 'application/x-www-form-urlencoded',
                    options.headers['content-type'] = args.headers !== undefined ? args.headers['Content-Type'] : 'application/x-www-form-urlencoded';
                    debug(" content-type  ===>", options.headers['content-type']);
                    debug(" header content-length: ",options.headers['Content-Length']);
                    // we have args, go and check if we have parameters
                    /*if (args.parameters && Object.keys(args.parameters).length > 0){
                     // validate URL consistency, and fix it
                     options.path +=(options.path.charAt(url.length-1) === '?'?"?":"");
                     options.path = options.path.concat(ServiceUtil.encodeQueryFromArgs(args.parameters));
                     debug("options.path after request parameters = ", options.path);
                     }*/

                    // override client config, by the moment just for request response config
                    this.overrideClientConfig(options, args);
                }


                debug("options post connect", options);
                debug("FINAL SELF object  ====>", self);


                // normal connection and direct proxy connections (no tunneling)
                ConnectManager.normal(options, callback);
            },
            mergeMimeTypes: function (mimetypes) {
                // merge mime-types passed as options to client
                if (mimetypes && typeof mimetypes === "object") {
                    if (mimetypes.json && mimetypes.json instanceof Array && mimetypes.json.length > 0) {
                        ConnectManager.jsonctype = mimetypes.json;
                    }
                }
            }
        },
        Method = function (url, method) {
            var httpMethod = self[method.toLowerCase()];

            return function (args, callback) {
                var completeURL = url;
                //no args
                if (typeof args === 'function') {
                    callback = args;
                    args = {};
                } else if (typeof args === 'object') {
                    // we have args, go and check if we have parameters
                    if (args.parameters && Object.keys(args.parameters).length > 0) {
                        // validate URL consistency, and fix it
                        url += (url.charAt(url.length - 1) === '?' ? "?" : "");
                        completeURL = url.concat(Util.encodeQueryFromArgs(args.parameters));
                        //delete args parameters we don't need it anymore in registered
                        // method invocation
                        delete args.parameters;
                    }
                }
                return httpMethod(completeURL, args, callback);
            };
        };


    this.get = function (url, args, callback) {
        var clientRequest = new ClientRequest();
        ServiceUtil.connect('GET', url, args, callback, clientRequest);
        return clientRequest;
    };

    this.post = function (url, args, callback) {
        var clientRequest = new ClientRequest();
        ServiceUtil.connect('POST', url, args, callback, clientRequest);
        return clientRequest;
    };

    this.put = function (url, args, callback) {
        var clientRequest = new ClientRequest();
        ServiceUtil.connect('PUT', url, args, callback, clientRequest);
        return clientRequest;
    };

    this.delete = function (url, args, callback) {
        var clientRequest = new ClientRequest();
        ServiceUtil.connect('DELETE', url, args, callback, clientRequest);
        return clientRequest;
    };

    this.patch = function (url, args, callback) {
        var clientRequest = new ClientRequest();
        ServiceUtil.connect('PATCH', url, args, callback, clientRequest);
        return clientRequest;
    };


    // handle ConnectManager events
    ConnectManager.on('error', function (err) {
        self.emit('error', err);
    });

    // merge mime types with connect manager
    ServiceUtil.mergeMimeTypes(self.mimetypes);
    debug("ConnectManager", ConnectManager);

};


var ConnectManager = {
    "xmlctype": ["application/xml", "application/xml;charset=utf-8"],
    "jsonctype": ["application/json", "application/json;charset=utf-8", "application/x-www-form-urlencoded"],
    "isXML": function (content) {
        var result = false;
        if (!content) return result;

        for (var i = 0; i < this.xmlctype.length; i++) {
            result = this.xmlctype[i].toLowerCase() === content.toLowerCase();
            if (result) break;
        }

        return result;
    },
    "isJSON": function (content) {
        var result = false;
        if (!content) return result;

        for (var i = 0; i < this.jsonctype.length; i++) {
            result = this.jsonctype[i].toLowerCase() === content.toLowerCase();
            if (result) break;
        }

        return result;
    },
    "isValidData": function (data) {
        return data !== undefined && (data.length !== undefined && data.length > 0);
    },
    "configureRequest": function (req, config, clientRequest) {

        if (config.timeout) {
            req.setTimeout(config.timeout, function () {
                clientRequest.emit('requestTimeout', req);
            });
        }
        if (config.noDelay)
            req.setNoDelay(config.noDelay);

        if (config.keepAlive)
            req.setSocketKeepAlive(config.noDelay, config.keepAliveDelay || 0);

    },
    "configureResponse": function (res, config, clientRequest) {
        if (config.timeout) {
            res.setTimeout(config.timeout, function () {
                clientRequest.emit('responseTimeout', res);
                res.close();
            });
        }
    },
    "handleEnd": function (res, buffer, callback) {

        var self = this,
            content = res.headers["content-type"],
            encoding = res.headers["content-encoding"];

        debug("content-type: ", content);
        debug("content-encoding: ", encoding);

        if (encoding !== undefined && encoding.indexOf("gzip") >= 0) {
            debug("gunzip");
            zlib.gunzip(Buffer.concat(buffer), function (er, gunzipped) {
                self.handleResponse(res, gunzipped, callback);
            });
        } else if (encoding !== undefined && encoding.indexOf("deflate") >= 0) {
            debug("inflate");
            zlib.inflate(Buffer.concat(buffer), function (er, inflated) {
                self.handleResponse(res, inflated, callback);
            });
        } else {
            debug("not compressed");
            self.handleResponse(res, Buffer.concat(buffer), callback);
        }
    },
    "handleResponse": function (res, data, callback) {
        var content = res.headers["content-type"] && res.headers["content-type"].replace(/ /g, '');

        debug("response content is ", content);
        // XML data need to be parsed as JS object
        if (this.isXML(content)) {
            parseString(data.toString(), function (err, result) {
                callback(result, res);
            });
        } else if (this.isJSON(content)) {
            var jsonData,
                data = data.toString();
            try {
                jsonData = this.isValidData(data) ? JSON.parse(data) : data;
            } catch (err) {
                // Something went wrong when parsing json. This can happen
                // for many reasons, including a bad implementation on the
                // server.
                jsonData = 'Error parsing response. response: [' + data + '], error: [' + err + ']';

            }
            if('undefined' === typeof jsonData.ret){
                callback(jsonData, res);
            }else{
                if(1 === jsonData.ret){
                    var retData;
                    if (jsonData.data){
                        retData=jsonData.data;
                    }
                    if (jsonData.list){
                        retData=jsonData.list;
                    }
                    if (jsonData.map){
                        retData=jsonData.map;
                    }
                    debug(" json data ret ==>",retData);
                    callback(retData, res);
                }else{
                    debug(" res data err msg ==>",jsonData);
                    callback(typeof jsonData=== 'string' ? jsonData :jsonData.message, res);
                }
            }

        } else {
            debug(" res data txt or html msg ==>",data);
            // html txt res
            callback(data, res);
        }
    },
    "prepareData": function (data) {
        var result;
        if ((data instanceof Buffer) || (typeof data !== 'object')) {
            result = data;
        } else {
            //result = JSON.stringify(data);
            result = querystring.stringify(data);
        }
        return result;
    },
    "normal": function (options, callback) {

        var buffer = [],
            protocol = (options.protocol === "http") ? http : https,
            clientRequest = options.clientRequest,
            requestConfig = options.requestConfig,
            responseConfig = options.responseConfig,
            self = this;

        //remove "protocol" and "clientRequest" option from options, cos is not allowed by http/hppts node objects
        delete options.protocol;
        delete options.clientRequest;
        delete options.requestConfig;
        delete options.responseConfig;
        debug("options pre connect", options);

        // add request options to request returned to calling method
        clientRequest.options = options;

        /********************* http / https 请求开始  *****************/
        var request = protocol.request(options, function (res) {
            //configure response
            self.configureResponse(res, responseConfig, clientRequest);

            // concurrent data chunk handler
            res.on('data', function (chunk) {
                buffer.push(new Buffer(chunk));
            });

            res.on('end', function () {
                self.handleEnd(res, buffer, callback);
            });

            // handler response errors
            res.on('error', function (err) {
                if (clientRequest !== undefined && typeof clientRequest === 'object') {
                    // add request as property of error
                    err.request = clientRequest;
                    err.response = res;
                    // request error handler
                    clientRequest.emit('error', err);
                } else {
                    // general error handler
                    self.emit('error', err);
                }
            });
        });

        // configure request and add it to clientRequest
        // and add it to request returned
        self.configureRequest(request, requestConfig, clientRequest);
        debug("clientRequest", clientRequest);

        //属性返回
        clientRequest.setHttpRequest(request);

        // handle request errors and handle them by request or general error handler
        request.on('error', function (err) {
            debug('request error', clientRequest);
            if (clientRequest !== undefined && typeof clientRequest === 'object') {
                // add request as property of error
                err.request = clientRequest;
                // request error handler
                clientRequest.emit('error', err);
            } else {
                // general error handler
                self.emit('error', err);
            }
        });


        debug("options data", options.data);
        // write POST/PUT data to request body;
        if (options.data) request.write(this.prepareData(options.data));

        request.end();
        /******************************* http/https请求结束  ************************************/

    }
};


// event handlers for client and ConnectManager
util.inherits(exports.Client, events.EventEmitter);
util._extend(ConnectManager, events.EventEmitter.prototype);


var debug = function () {
    //if (process.env.NODE_ENV !="test") return;

    var now = new Date(),
        header = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + " -> ",
        args = Array.prototype.slice.call(arguments);
    args.splice(0, 0, header);
    console.log(args);
    //node_debug.apply(console,args);
};
