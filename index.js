var utils = require('./lib/utils');
var FontminRunner = require('./lib/FontminRunner');
var BosUplaoder = require('./lib/BosUploader');
var CssProcessor = require('./lib/CssProcessor');

function runner(options) {
    var fontminRunner = new FontminRunner(options);
    var bosUplaoder = new BosUplaoder(options);
    var cssProcessor = new CssProcessor(options);

    var processCss = function (css) {
        return utils.compose(
            cssProcessor.tripComments,
            cssProcessor.addCdnHost
        ).bind(cssProcessor);
    };

    return fontminRunner.run()
        .then(function (files) {
            return bosUplaoder.run(files);
        })
        .then(function (files) {
            files.css.content = processCss(files.css.content);
            return files;
        });
};

module.exports = runner;
