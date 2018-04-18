var path = require('path');
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
            hash: 'sjdifji1319340eadf',
            texts: [
                {
                    text: '江',
                    fontFamily: 'xingkai'
                },
                {
                    text: '主',
                    fontFamily: 'simhei'
                },
                {
                    text: '席子',
                    fontFamily: 'arial'
                },
            ]
        });

        // 处理css，替换路径等
        bosFontmin.register('css', {
            fileName: 'font.sjdifji1319340eadf.css',
            host: 'laser.cdn.com',
            fontPrefix: '/lasertest/static/public/fonts',
            cssPrefix: '/lasertest/static/public/css',
        });

        // 最后再上传所有文件
        bosFontmin.register('bos', {
            bosConfig: {
                credentials: {
                    ak: '',
                    sk: ''
                },
                endpoint: 'http://laser.cdn.com'
            },
            bucket: 'laser',
            fontPrefix: '/lasertest/static/public/fonts',
            cssPrefix: '/lasertest/static/public/css',
        });
    });

    it('uploader', function () {
        this.timeout(10000);

        return bosFontmin.run()
            .then(function (files) {
                // 输入了3个字体，每个3个字体文件
                files.fonts.length.should.be.equal(3 * 4);

                // 合并成一个css文件
                files.css.length.should.be.equal(1);

                files.css.forEach(function (css) {
                    path.extname(css.name).should.equal('.css');
                });
            });
    });

    it('list fonts', function () {
        this.timeout(10000);

        return bosFontmin.listFonts()
            .then(function (files) {
                return files;
            });
    });

    it('delete fonts', function () {
        this.timeout(10000);

        return bosFontmin.run()
            .then(function (files) {
                return bosFontmin.deleteFonts(files);
            });
    });
});
