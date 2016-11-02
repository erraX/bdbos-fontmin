var path = require('path');
var utils = require('./utils');
var bce = require('baidubce-sdk');

var assertRequired = utils.assertRequired;

/**
 * 输出log信息
 *
 * @param {object} file 文件
 */
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

/**
 * 过滤需要上传的文件
 *
 * @param {Array} files 输入的文件
 * 
 * @return {Array}
 */
BosUploader.prototype.filterFiles = function (files) {
    return files;
};

/**
 * 添加一些文件的属性
 *
 * @param {object} file 输入的文件
 * 
 * @return {object}
 */
BosUploader.prototype.getFileDetail = function (file) {
    return Object.assign(file, {
        key: path.join(this.prefix, file.name),
    });
};

/**
 * bos上传文件时的选项
 *
 * @param {object} file 输入的文件
 * 
 * @return {object}
 */
BosUploader.prototype.getUploadOptions = function (file) {
    return {
        'Content-Type': bce.MimeType.guess(path.extname(file.name))
    };
};

/**
 * bos上传单个文件
 *
 * @param {object} fileDetail 文件
 * @param {object} options 上传选项
 * 
 * @return {Promise}
 */
BosUploader.prototype.put = function (fileDetail, options) {
    return this.client.putObjectFromDataUrl(this.bucket, fileDetail.key, fileDetail.data, options);
};

/**
 * bos上传单个文件
 *
 * @param {object} file 文件
 * 
 * @return {Promise}
 */
BosUploader.prototype.upload = function (file) {
    var fileDetail = this.getFileDetail(file);
    var options = this.getUploadOptions(file);

    return this.put(fileDetail, options);
};

/**
 * bos上传所有的文件
 *
 * @param {Array} files 文件
 * 
 * @return {Promise}
 */
BosUploader.prototype.processUploadFiles = function (files) {
    var me = this;

    var doUpload = function (file) {

        // 计算一下一共花了多久上传
        var start = Date.now();
        var fileDetail = me.getFileDetail(file);

        // 上传成功
        var successHandler = function (response) {
            var end = Date.now();
            var duration = (end - start) + 'ms';

            return Object.assign(fileDetail, {
                response: response,
                duration: duration,
                prefix: me.prefix
            });
        };

        // 上传失败
        var failHandler = function (fail) {
            throw fail;
        };

        return me.upload(file).then(successHandler, failHandler);
    };

    return this.filterFiles(files).map(doUpload);
};

/**
 * 输出之前处理css文件
 *
 * @param {object} file css文件
 *
 * @return {Promise}
 */
BosUploader.prototype.processCssFile = function (file) {
    return Promise.resolve(file);
};

/**
 * 输出之前处理所有文件
 *
 * @param {Array} files 所有文件
 *
 * @return {Promise}
 */
BosUploader.prototype.processAllFiles = function (files) {
    return this.processUploadFiles(files.fonts).concat(this.processCssFile(files.css));
};

/**
 * 列出当前`bucket`和`prefix`里面的所有文件
 *
 * @return {Promise}
 */
BosUploader.prototype.listObjects = function () {
    var options = {
        prefix: this.prefix.slice(1)
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

    return Promise.all(files.map(function (file) {
        return me.client.deleteObject(me.bucket, file.key);
    }));
};

/**
 * 开始上传
 *
 * @param {Array} files 所有文件
 *
 * @return {Promise}
 */
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
