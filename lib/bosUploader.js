var path = require('path');
var utils = require('./utils');
var bce = require('baidubce-sdk');

var assertRequired = utils.assertRequired;

/**
 * @constructor
 *
 * @param {object} config config
 * @param {string} config.cssPrefix 上传到BOS上的css相对路径
 * @param {string} config.fontPrefix 上传到BOS上的字体相对路径
 * @param {string} config.bucket bucket
 * @param {object} config.bosConfig bos配置
 * @param {Array} config.files 需要上传的文件
 *
 * @return {Promise}
 */
function BosUploader(config) {

    // 检验必传参数
    assertRequired(config, 'fontPrefix');
    assertRequired(config, 'cssPrefix');
    assertRequired(config, 'bucket');
    assertRequired(config, 'bosConfig');
    assertRequired(config.bosConfig, 'credentials');
    assertRequired(config.bosConfig, 'endpoint');
    assertRequired(config.bosConfig.credentials, 'ak');
    assertRequired(config.bosConfig.credentials, 'sk');

    this.fontPrefix = config.fontPrefix;
    this.cssPrefix = config.cssPrefix;
    this.bucket = config.bucket;
    this.bosConfig = config.bosConfig;
    this.debug = config.debug;

    this.client = new bce.BosClient(this.bosConfig);
}

/**
 * 列出当前`bucket`和`prefix`里面的所有文件
 *
 * @return {Promise}
 */
BosUploader.prototype.listObjects = function (type) {
    var prefix;

    if (type === 'css') {
        prefix = this.cssPrefix.slice(1);
    }
    else {
        prefix = this.fontPrefix.slice(1);
    }

    var options = {
        prefix: prefix
    };

    // 列出文件成功
    var onSuccess = function (response) {
        var contents = response.body.contents;
        
        // for (var i = 0, l = contents.length; i < l; i++) {
        //     console.log(contents[i].key);
        // }

        return contents;
    };

    // 列出文件失败
    var onFail = function (error) {
        console.error(error);
        throw error;
    };

    return this.client.listObjects(this.bucket, options)
            .then(onSuccess)
            .catch(onFail);
};

/**
 * 删除bos上的文件
 *
 * @param {Array} files 所有文件
 *
 * @return {Promise}
 */
BosUploader.prototype.deleteObject = function (files) {
    var me = this;

    files = [].concat(files.fonts, files.css);

    return Promise.all(files.map(function (file) {
        return me.client.deleteObject(me.bucket, file.key);
    }));
};

BosUploader.prototype.uploadFiles = function (files, options) {
    var me = this;

    return Promise.all(files.map(function (file) {
        return me.uploadFile(file, options);
    }));
};

BosUploader.prototype.afterUploadFile = function (file, uploadResponse) {
    return Object.assign(file, uploadResponse);
};

BosUploader.prototype.uploadFile = function (file, options) {
    options = options || {};

    options['Content-Type'] = bce.MimeType.guess(path.extname(file.name));

    return this.client.putObjectFromDataUrl(this.bucket, file.key, file.data, options)
        .then(this.afterUploadFile.bind(this, file));
};

BosUploader.prototype.prepareUploadFontFiles = function (fontFiles) {
    var i;

    for (i = 0; i < fontFiles.length; i++) {
        var file = fontFiles[i];
        file.key = path.join(this.fontPrefix, file.name);
    }

    return fontFiles;
};

BosUploader.prototype.prepareUploadCssFiles = function (cssFiles) {
    var i;

    for (i = 0; i < cssFiles.length; i++) {
        var file = cssFiles[i];
        file.key = path.join(this.cssPrefix, file.name);
        file.data = new Buffer(file.content).toString('base64');
    }

    return cssFiles;
};

BosUploader.prototype.uploadFontFiles = function (fontFiles) {
    var me = this;
    fontFiles = this.prepareUploadFontFiles(fontFiles);
    return this.uploadFiles(fontFiles);
};

BosUploader.prototype.uploadCssFiles = function (cssFiles) {
    var me = this;
    cssFiles = this.prepareUploadCssFiles(cssFiles);
    return this.uploadFiles(cssFiles);
};

/**
 * 开始上传
 *
 * @param {Array} files 所有文件
 *
 * @return {Promise}
 */
BosUploader.prototype.run = function (files) {
    return Promise.all([
            this.uploadFontFiles(files.fonts),
            this.uploadCssFiles(files.css)
        ])
        .then(function (files) {
            return {
                fonts: files[0],
                css: files[1],
            };
        });
};

module.exports = BosUploader;
