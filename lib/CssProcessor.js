var utils = require('./utils');
var assertRequired = utils.assertRequired;

function CssProcessor(options) {
    assertRequired(options, 'host');
    assertRequired(options, 'prefix');

    this.host = options.host;
    this.prefix = options.prefix;
}

CssProcessor.prototype.tripComments = function (css) {
    return css.replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '');
};

CssProcessor.prototype.addCdnHost = function (css) {
    return css.replace(/url\("([^"]*)"\)/g, function (match, $1) {
        return utils.format('url("//${host}${prefix}${file}")', {
            host: this.host,
            prefix: this.prefix,
            file: $1
        });
    }.bind(this));
};

CssProcessor.prototype.run = function (files) {
    var me = this;

    var processCss = function (css) {
        return utils.compose(
            me.tripComments,
            me.addCdnHost
        ).bind(me);
    };

    files.css.content = processCss()(files.css.content);

    return files;
};

module.exports = CssProcessor;
