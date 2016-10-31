var chai = require('chai');
var should = chai.should();

var BosFontmin = require('../../index');

describe('BosFontmin', function () {
    var fm;
    var bosFontmin;

    beforeEach(function () {
        bosFontmin = new BosFontmin();

        // 这个必须一开始就注册
        bosFontmin.register('fontmin', {
            text: '江',
            fontFamily: 'xingkai'
        });

        bosFontmin.register('bos', {
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

        bosFontmin.register('css', {
            host: 'laser.bj.bcebos.com',
            prefix: '/lasertest/static/public/fonts'
        });
    });

    it('uploader', function () {
        this.timeout(10000);

        return bosFontmin.run()
            .then(function (files) {
                files.should.have.property('fonts');
                files.should.have.property('css');

                files.fonts.length.should.be.equal(4);
            });
    });

    it('list fonts', function () {
        this.timeout(10000);

        return bosFontmin.listFonts();
    });

    it('delete fonts', function () {
        this.timeout(10000);

        return bosFontmin.run()
            .then(function (files) {
                bosFontmin.deleteFonts(files.fonts);
            });
    });
});
