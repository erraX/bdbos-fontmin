var path = require('path');
var utils = require('./utils');
var rename = require('gulp-rename');
var Fontmin = require('fontmin');

var assertRequired = utils.assertRequired;

// 默认的选项
var defaultOptions = {

    // md5
    hash: '',

    // 是否显示log
    debug: false,

    // 字体源文件的路径
    fontsPath: './fonts',

    // 输出路径
    outputPath: null,

    // 输出的字体文件格式
    fontTypes: ['eot', 'ttf', 'svg', 'woff'],

    // 需要抽取的字和字体
    texts: null,
};

/**
 * @constructor
 *
 * 封装一下`fontmin`
 *
 * @param {object} options 选项
 */
function FontminRunner(options) {

    // 检验必传参数
    assertRequired(options, 'texts');

    options.texts.forEach(function (text) {
        assertRequired(text, 'text');
        assertRequired(text, 'fontFamily');
    });

    Object.assign(this, defaultOptions, options);
}

/**
 * 使用`fontmin`的字体插件
 * `ttf2eto`  `ttf2svg` `ttf2woff`
 *
 * @param {Array} fontTypes 输出的字体文件类型
 *
 * @return {object}
 */
FontminRunner.prototype._applyFontTypePlugins = function (fontmin) {
    var fontTypes = this.fontTypes.map(function (type) {
        return type.toLowerCase();
    });

    fontTypes.forEach(function (type) {

        // *.ttf的自己会生成，不需要插件
        if (type === 'ttf') {
            return;
        }

        fontmin.use(Fontmin['ttf2' + type]());
    });

    return this;
};

/**
 * 设置字体的目录
 *
 * @return {FontminRunner}
 */
FontminRunner.prototype._applySrc = function (fontmin, fontFamily) {
    // 只滋瓷`*.ttf`文件
    var computedPath = path.join(this.fontsPath, fontFamily + '.ttf');

    if (this.hash) {
        fontmin.src(computedPath).use(rename(fontFamily + '.' + this.hash + '.ttf'));
    }
    else {
        fontmin.src(computedPath);
    }

    return this;
};

/**
 * 设置输入的字
 *
 * @return {FontminRunner}
 */
FontminRunner.prototype._applyText = function (fontmin, text) {
    fontmin.use(Fontmin.glyph({ text }));

    return this;
};

/**
 * 设置生成css选项
 *
 * @return {FontminRunner}
 */
FontminRunner.prototype._applyCss = function (fontmin, fontFamily) {
    fontmin.use(Fontmin.css({
        fontFamily
    }));

    return this;
};

/**
 * 字体子集输出路径
 *
 * @return {FontminRunner}
 */
FontminRunner.prototype._applyDest = function (fontmin) {
    this.outputPath && fontmin.dest(this.outputPath);

    return this;
};

/**
 * 把`vinyl`文件转成`base64`的格式
 *
 * @param {object} file 字体文件
 *
 * @return {object}
 */
FontminRunner.prototype.vinyl2Base64 = function (file) {
    return {
        name: file.relative,
        data: file.contents.toString('base64')
    };
};

/**
 * 把`vinyl`文件转成字符串格式
 *
 * @param {object} file css文件
 *
 * @return {object}
 */
FontminRunner.prototype.vinyl2String = function (file) {
    return {
        name: file.relative,
        content: file.contents.toString()
    };
};

/**
 * 通过`fontmin`生成字体和css之后，增加一些处理，然后再输出
 *
 * @param {Array} files 字体和css文件
 *
 * @return {Array}
 */
FontminRunner.prototype.beforeResolveFiles = function (files) {
    var me = this;

    files = files.reduce(function (result, file) {
        if (path.extname(file.relative) === '.css') {
            result.css = me.vinyl2String(file);
        }
        else {
            result.fonts.push(me.vinyl2Base64(file));
        }

        return result;
    }, {
        fonts: [],
        css: {}
    });

    return files;
};

/**
 * 通过`fontmin`生成字体和css之后，增加一些处理，然后再输出
 *
 * @param {Array} files 字体和css文件
 *
 * @return {Array}
 */
FontminRunner.prototype.runEach = function (eachText) {
    var me = this;
    var fontmin = new Fontmin();

    this._applySrc(fontmin, eachText.fontFamily)
        ._applyText(fontmin, eachText.text)
        ._applyFontTypePlugins(fontmin)
        ._applyCss(fontmin, eachText.fontFamily)
        ._applyDest(fontmin);

    return new Promise(function (resolve, reject) {
        var runFn = function (error, files) {
            if (error) {
                reject(error);
                return;
            }

            resolve(me.beforeResolveFiles(files));
        };

        // 开始转换每组字体
        fontmin.run(runFn);
    });
};

/**
 * 把每组生成的字体和css整合在一起
 *
 * @param {Array} files files
 *
 * @return {Object}
 */
FontminRunner.prototype.mergeFiles = function (files) {
    return files.reduce(function (result, file) {
        result.fonts = result.fonts.concat(file.fonts);
        result.css = result.css.concat(file.css);

        return result;
    }, {
        fonts: [],
        css: [],
    });
};

/**
 * 开始`fontmin`转换
 *
 */
FontminRunner.prototype.run = function () {
    return Promise.all(this.texts.map(this.runEach.bind(this)))
        .then(this.mergeFiles)
        .catch(function (error) {
            throw error;
        })
};

module.exports = FontminRunner;
