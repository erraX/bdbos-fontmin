var utils = require('./utils');
var assertRequired = utils.assertRequired;

/**
 * @constructor
*
 * 处理css
 *
 * @param {object} options 选项
 */
function CssProcessor(options) {
    assertRequired(options, 'host');
    assertRequired(options, 'prefix');

    this.host = options.host;
    this.prefix = options.prefix;
}

/**
 * 去掉注释
 *
 * @param {string} css css字符串
 *
 * @return {string}
 */
CssProcessor.prototype.tripComments = function (css) {
    if (!css) {
        return;
    }

    return css.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
};

/**
 * 添加bos地址前缀
 *
 * @param {string} css css字符串
 *
 * @return {string}
 */
CssProcessor.prototype.addCdnHost = function (css) {
    if (!css) {
        return;
    }

    return css.replace(/url\("([^"]*)"\)/g, function (match, $1) {
        return utils.format('url("//${host}${prefix}${file}")', {
            host: this.host,
            prefix: this.prefix,
            file: $1
        });
    }.bind(this));
};

/**
 * 开始处理css
 *
 * @param {Array} files 输入文件
 *
 * @return {Promise}
 */
CssProcessor.prototype.run = function (files) {
    var me = this;

    var processCss = function (css) {
        return utils.compose(
            me.tripComments,
            me.addCdnHost
        ).bind(me);
    };

    files.css.content = processCss()(files.css.content);

    return Promise.resolve(files);
};

module.exports = CssProcessor;
