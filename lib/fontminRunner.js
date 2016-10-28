var path = require('path');
var Fontmin = require('fontmin');

var defaultOptions = {

    // 是否显示log
    debug: false,

    // 字体源文件的路径
    fontsPath: './fonts',

    // 输出路径
    // outputPath: './output',
    outputPath: null,

    // 输出的字体文件格式
    fontTypes: ['eot', 'ttf', 'svg', 'woff'],

    // 需要抽取的字
    text: null,

    // 定义`font-family`
    fontFamily: null
};

/**
 * 有没有传入必要的参数
 *
 * @param {string} path 字体的绝对路径
 */
function validateParams(options) {
    var required = [
        'text',
        'fontFamily'
    ];

    required.forEach(function (name) {
        if (!options[name]) {
            throw name + ' must be pass in fontmin runner';
        }
    });
}

/**
 * 使用`fontmin`的字体插件
 * `ttf2eto`  `ttf2svg` `ttf2woff`
 * @param {object] fontmin Fontmin实例
 * @param {Array] fontTypes 输出的字体文件类型
 *
 * @return {object}
 */
function applyFontTypePlugins(fontmin, fontTypes) {
    fontTypes = fontTypes.map(function (type) {
        return type.toLowerCase();
    });

    fontTypes.forEach(function (type) {

        // *.ttf的自己会生成，不需要插件
        if (type === 'ttf') {
            return;
        }

        fontmin.use(Fontmin['ttf2' + type]());
    });

    return fontmin;
}

/**
 * 生成字体子集
 *
 * @param {object} options options
 *
 * @return {Promise}
 */
module.exports = function (options) {
    options = Object.assign({}, defaultOptions, options);

    // 检验必传字段
    validateParams(options);

    var debug = options.debug;

    var fontmin = new Fontmin();

    fontmin.src(path.join(options.fontsPath, options.fontFamily + '.ttf'));

    // 输入文字
    fontmin.use(Fontmin.glyph({ text: options.text }));

    // 输出字体文件类型
    applyFontTypePlugins(fontmin, options.fontTypes);

    // 输出css
    fontmin.use(Fontmin.css({
        fontFamily: options.fontFamily
    }));

    // 有`outputPath`就输出到那里，没有就放在内存里，后面再处理
    options.outputPath && fontmin.dest(options.outputPath);

    return new Promise(function (resolve, reject) {
        var runFn = function (error, files, stream) {
            if (error) {
                debug && console.error(error);

                reject(error, files, stream);
            }

            debug && console.info('done');
            resolve(files, stream);
        };

        debug && console.info('start generate fonts...')
        // 开始转换
        fontmin.run(runFn);
    });
};
