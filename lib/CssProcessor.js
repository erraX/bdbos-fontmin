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
    assertRequired(options, 'fontPrefix');
    assertRequired(options, 'cssPrefix');

    this.host = options.host;
    this.fontPrefix = options.fontPrefix;
    this.cssPrefix = options.cssPrefix;
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
            prefix: this.fontPrefix,
            file: $1
        });

    }.bind(this));
};

/**
 * 把所有字体的css `@font-face` 全部搞在一起
 *
 * @param {Array} cssGroup 所有的css
 *
 * @return {string}
 */
CssProcessor.prototype.concatCss = function (cssGroup, cssHandler) {
    return cssGroup.reduce(function (str, css) {
        return str + cssHandler(css.content);
    }, '');
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

    var cssHandler = function (css) {
        return utils.compose(
            me.tripComments,
            me.addCdnHost
        ).bind(me);
    };

    files.css = [{
        name: 'font.css',
        content: this.concatCss(files.css, cssHandler())
    }];

    return Promise.resolve(files);
};

module.exports = CssProcessor;
