var chai = require('chai');
var should = chai.should();

var uploadFont = require('../../index');

describe('bosUploader', function () {
    var fm;

    beforeEach(function () {
    });

    it('uploader', function () {
        this.timeout(10000);

        return uploadFont({
            text: '江',
            fontFamily: 'xingkai',
            bosConfig: {
                credentials: {
                    ak: 'fc35e789187047bf930a9b085a328566',
                    sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                },
                endpoint: 'http://bj.bcebos.com'
            },
            bucket: 'laser',
            prefix: '/lasertest/static/public/fonts',
            host: 'laser.bj.bcebos.com'
        })
        .then(function (files) {
            files.should.have.property('fonts');
            files.should.have.property('css');

            files.fonts.length.should.be.equal(4);

            console.log(files.css);
        });
    });
});
