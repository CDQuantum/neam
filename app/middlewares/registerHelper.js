'use strict';
/**
 * Project : nerm-Bootstrap-Starter
 * Created by rener on 16/2/13.
 * Name:
 * Desc:
 */
const blocks = {};
module.exports = {
    compare: function (v1, v2, options) {
        if (v1 > v2) {
            //满足添加继续执行
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    equal: function (v1, v2, options) {
        if (v1 === v2) {
            //满足添加继续执行
            return options.fn(this);
        } else {
            //不满足条件执行{{else}}部分
            return options.inverse(this);
        }
    },
    extend:function(name, context) {
        var block = blocks[name];
        if (!block) {
            block = blocks[name] = [];
        }
        block.push(context.fn(this)); // for older versions of handlebars, use block.push(context(this));
    },
    block:function(name) {
        var val = (blocks[name] || []).join('\n');
        // clear the block
        blocks[name] = [];
        return val;
    }

};




