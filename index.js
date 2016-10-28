var runner = require('./lib/fontminRunner');
var uploader = require('./lib/bosUploader');

module.exports = function (options) {
    return runner(options)
        .then(function (files) {
            return uploader({
                files: files,
                bosConfig: options.bosConfig,
                bucket: options.bucket,
                prefix: options.prefix,
            });
        });
};
