var chai = require('chai');
var bosUploader = require('../lib/bosUploader');
var fontmin = require('../lib/fontminRunner');

var should = chai.should();

describe('bosUploader', function () {
    it('uploader', function () {
        return fontmin({
            text: '江主席',
            fontFamily: 'xingkai',
        })
        .then(function (files, stream) {
            return bosUploader({
                files: files,
                bosConfig: {
                    credentials: {
                        ak: 'fc35e789187047bf930a9b085a328566',
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                bucket: 'laser',
                prefix: '/lasertest/static/public/fonts'
            });
        })
    });
});
