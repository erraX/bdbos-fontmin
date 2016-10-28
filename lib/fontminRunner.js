var path = require('path');
var utils = require('./utils');
var Fontmin = require('fontmin');

var assertRequired = utils.assertRequired;

var defaultOptions = {

    // 是否显示log
    debug: false,

    // 字体源文件的路径
    fontsPath: './fonts',

    // 输出路径
    outputPath: null,

    // 输出的字体文件格式
    fontTypes: ['eot', 'ttf', 'svg', 'woff'],

    // 需要抽取的字
    text: null,

    // 定义`font-family`
    fontFamily: null
};

function FontminRunner(options) {

    // 检验必传参数
    assertRequired(options, 'text');
    assertRequired(options, 'fontFamily');

    Object.assign(this, defaultOptions, options);

    // 搞一个fontmin出来
    this.fontmin = new Fontmin();
}

/**
 * 使用`fontmin`的字体插件
 * `ttf2eto`  `ttf2svg` `ttf2woff`
 *
 * @param {Array] fontTypes 输出的字体文件类型
 *
 * @return {object}
 */
FontminRunner.prototype._applyFontTypePlugins = function () {
    var me = this;
    var fontTypes = this.fontTypes.map(function (type) {
        return type.toLowerCase();
    });

    fontTypes.forEach(function (type) {

        // *.ttf的自己会生成，不需要插件
        if (type === 'ttf') {
            return;
        }

        me.fontmin.use(Fontmin['ttf2' + type]());
    });

    return this;
};

FontminRunner.prototype._applySrc = function () {
    // 只滋瓷`*.ttf`文件
    var computedPath = path.join(this.fontsPath, this.fontFamily + '.ttf');
    this.fontmin.src(computedPath);
    return this;
};

FontminRunner.prototype._applyText= function () {
    this.fontmin.use(Fontmin.glyph({ text: this.text }));

    return this;
};

FontminRunner.prototype._applyCss= function () {
    this.fontmin.use(Fontmin.css({
        fontFamily: this.fontFamily
    }));

    return this;
};

FontminRunner.prototype._applyDest= function () {
    this.outputPath && this.fontmin.dest(this.outputPath);

    return this;
};

FontminRunner.prototype.beforeResolveFiles = function (files) {
    var me = this;

    files = files.reduce(function (result, file) {
        if (path.extname(file.relative) === '.css') {
            result.css = file;
        }
        else {
            result.fonts.push(file);
        }

        return result;
    }, {
        fonts: [],
        css: {}
    });

    return files;
};

FontminRunner.prototype.run = function () {
    var me = this;

    this._applySrc()
        ._applyText()
        ._applyFontTypePlugins()
        ._applyCss()
        ._applyDest();

    return new Promise(function (resolve, reject) {
        var runFn = function (error, files) {
            if (error) {
                this.debug && console.error(error);

                reject(error, files);
            }

            me.debug && console.info('done');

            resolve(me.beforeResolveFiles(files));
        };

        me.debug && console.info('start generate fonts...')

        // 开始转换
        me.fontmin.run(runFn);
    });
};

module.exports = FontminRunner;
