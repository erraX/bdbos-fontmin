var path = require('path');
var utils = require('./utils');
var bce = require('baidubce-sdk');

var assertRequired = utils.assertRequired;

function logger(file) {
    console.log(utils.format('Upload: ${name} to ${path} finished! [${duration}]', {
        name: file.detail.name,
        path: file.prefix,
        duration: file.duration
    }));
}

/**
 * @constructor
 *
 * @param {object} config config
 * @param {string} config.prefix 上传到BOS上的相对路径
 * @param {string} config.bucket bucket
 * @param {object} config.bosConfig bos配置
 * @param {Array} config.files 需要上传的文件
 *
 * @return {Promise}
 */
function BosUploader(config) {

    // 检验必传参数
    assertRequired(config, 'prefix');
    assertRequired(config, 'bucket');
    assertRequired(config, 'bosConfig');
    assertRequired(config.bosConfig, 'credentials');
    assertRequired(config.bosConfig, 'endpoint');
    assertRequired(config.bosConfig.credentials, 'ak');
    assertRequired(config.bosConfig.credentials, 'sk');

    this.prefix = config.prefix;
    this.bucket = config.bucket;
    this.bosConfig = config.bosConfig;
    this.debug = config.debug;

    this.client = new bce.BosClient(this.bosConfig);
}

BosUploader.prototype.filterFiles = function (files) {
    return files;
    // return files.filter(function (file) {
    //     // css文件不上传
    //     return !/\.css/.test(file.relative);
    // });
};

BosUploader.prototype.vinyl2Base64 = function (file) {
    return file.contents.toString('base64');
};

BosUploader.prototype.vinyl2String = function (file) {
    return file.contents.toString();
};

BosUploader.prototype.getFileDetail = function (file) {
    return {
        // 文件名
        name: file.relative,

        // `BOS`上的相对路径
        remotePath: path.join(this.prefix, file.relative),

        // base64
        data: this.vinyl2Base64(file)
    };
};

BosUploader.prototype.getUploadOptions = function (file) {
    return {
        'Content-Type': bce.MimeType.guess(path.extname(file.relative))
    };
};

BosUploader.prototype.put = function (fileDetail, options) {
    return this.client.putObjectFromDataUrl(this.bucket, fileDetail.remotePath, fileDetail.data, options);
};

BosUploader.prototype.upload = function (file) {
    var fileDetail = this.getFileDetail(file);
    var options = this.getUploadOptions(file);

    return this.put(fileDetail, options);
};

BosUploader.prototype.processUploadFiles = function (files) {
    var me = this;

    var doUpload = function (file) {
        var start = Date.now();
        var fileDetail = me.getFileDetail(file);

        var successHandler = function (response) {
            var end = Date.now();
            var duration = (end - start) + 'ms';

            return {
                response: response,
                detail: fileDetail,
                duration: duration,
                prefix: me.prefix
            };
        };

        var failHandler = function (fail) {
            throw fail;
        };

        return me.upload(file)
            .then(successHandler, failHandler);
    };

    return this.filterFiles(files)
        .map(doUpload);
};

BosUploader.prototype.processCssFile = function (file) {
    return Promise.resolve({
        content: this.vinyl2String(file)
    });
};

BosUploader.prototype.processAllFiles = function (files) {
    return this.processUploadFiles(files.fonts).concat(this.processCssFile(files.css));
};

BosUploader.prototype.run = function (files) {
    var me = this;

    return Promise.all(this.processAllFiles(files))
        .then(function (files) {
            me.debug && files.forEach(logger);
            return {
                fonts: files.slice(0, files.length - 1),
                css: files[files.length - 1]
            }
        });
};

module.exports = BosUploader;
