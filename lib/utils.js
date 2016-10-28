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

exports.isArray = function (target) {
    return Object.prototype.toString.call(target) === '[object Array]';
};
