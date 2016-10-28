var utils = require('./utils');
var path = require('path');
var bce = require('baidubce-sdk');

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
 * `BOS`配置，传了这个参数就上传到`BOS`上面
 * eg. {
 *        ak       : 'fc35e789187047bf930a9b085a328566',
 *        sk       : 'd9fa68c0a9724a4f82155fe7a10d98a0',
 *        endpoint : 'http://bj.bcebos.com',
 *        bucket   : 'laser',
 *        prefix   : '/static/fonts'
 *     }
 *
 *   @param {Array|object} files files
 *   @param {object] config bos config
 *
 * @return {Promise}
 */
function BosUploader(config) {
    this.prefix = config.prefix || '';
    this.bucket = config.bucket || '';
    this.bosConfig = config.bosConfig || {};
    this.files = config.files || [];

    if (!utils.isArray(this.files)) {
        this.files = [this.files];
    }

    this.client = new bce.BosClient(this.bosConfig);
}

BosUploader.prototype.filterFiles = function (files) {
    return files.filter(function (file) {
        // css文件不上传
        return !/\.css/.test(file.relative);
    });
};

BosUploader.prototype.vinyl2Base64 = function (file) {
    return file.contents.toString('base64');
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

BosUploader.prototype.uploadFiles = function () {
    var me = this;
    var files = this.files;

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

BosUploader.prototype.run = function () {
    return Promise.all(this.uploadFiles())
        .then(function (files) {
            files.forEach(logger);
            return files;
        });
};

module.exports = function (config) {
    return new BosUploader(config).run();
};
