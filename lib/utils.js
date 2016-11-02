var assert = require('assert');

var toString = Object.prototype.toString;

/**
* 字符串格式化
*
* 简单的格式化使用`${name}`进行占位
*
* @param {string} template 原字符串
* @param {Object} data 用于模板替换的数据
* @return {string} 格式化后的字符串
*/
exports.format = function (template, data) {
    if (!template) {
        return '';
    }

    if (data == null) {
        return template;
    }

    return template.replace(
        /\$\{(.+?)\}/g,
        function (match, key) {
            var replacer = data[key];
            if (typeof replacer === 'function') {
                replacer = replacer(key);
            }

            return replacer == null ? '' : replacer;
        }
    );
};

/**
 * 判断是否是数组
 *
 * @param {any} target
 *
 * @return {boolean}
 */
exports.isArray = function (target) {
    return toString.call(target) === '[object Array]';
};

/**
 * 判断是否是字符串
 *
 * @param {any} target
 *
 * @return {boolean}
 */
exports.isString = function (target) {
    return toString.call(target) === '[object String]';
};

/**
 * 判断是否是函数
 *
 * @param {any} target
 *
 * @return {boolean}
 */
exports.isFunction = function (target) {
    return toString.call(target) === '[object Function]';
};

/**
 * 检验对象内是否存在属性
 *
 * @param {object} options 输入对象
 * @param {object} name 对象内属性名称
 *
 * @return {boolean}
 */
exports.assertRequired = function (options, name) {
    assert(options[name], name + ' must be passed');
};

/**
 * compose函数
 *
 * @return {Function}
 */
exports.compose = function () {
    var i;
    var fns = arguments;

    return function() {
        var result = fns[0].apply(this, arguments);

        for(i = 1; i < fns.length; i++) {
            result = fns[i].call(this, result);
        }

        return result;
    };
};
