var path = require('path');
var fs = require('fs-extra');
var rmraf = require('rimraf');
var chai = require('chai');
var should = chai.should();

var FmRunner = require('../../lib/FontminRunner');
var Fontmin = require('fontmin');

describe('FontminRunner', function () {
    var fm;

    beforeEach(function () {
        fm = new FmRunner({
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
                    text: '席',
                    fontFamily: 'arial'
                },
            ]
        });
    });

    it('without texts, should throw error', function () {
        (function () {
            new FmRunner();
        }).should.throw(Error);
    });

    it('texts should be Array', function () {
        (function () {
            new FmRunner({
                texts: {
                    text: '江',
                    fontFamily: 'xingkai'
                }
            });
        }).should.throw(Error);
    });

    it('without fontFamily, should throw error', function () {
        (function () {
            new FmRunner({
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
                        text: '席',
                    },
                ]
            });
        }).should.throw(Error);
    });

    it('without text, should throw error', function () {
        (function () {
            new FmRunner({
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
                        fontFamily: 'arial'
                    },
                ]
            });
        }).should.throw(Error);
    });

    it('throw font file not found', function () {
        fm = new FmRunner({
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
                    text: '席',
                    fontFamily: 'ariall'
                },
            ]
        });

        return fm.run()
            .then(function (files) {
                return files; 
            })
            .catch(function (error) {
                error.message.should.be.match(/File not found/);
            });
    });

    it('test defaults options', function () {
        fm.debug.should.be.false;
        fm.fontsPath.should.equal('./fonts');
        should.equal(fm.outputPath, null);
        fm.fontTypes.should.eql(['eot', 'ttf', 'svg', 'woff']);
        fm.texts.should.eql([
            {
                text: '江',
                fontFamily: 'xingkai'
            },
            {
                text: '主',
                fontFamily: 'simhei'
            },
            {
                text: '席',
                fontFamily: 'arial'
            },
        ]);
    });

    it('should not generate font files locally', function () {
        this.timeout(10000);

        return fm.run()
            .then(function (files) {
                // 输入了3个字体，每个3个字体文件
                files.fonts.length.should.be.equal(3 * 4);

                // 每个字体一个css文件
                files.css.length.should.be.equal(3);

                files.css.forEach(function (css) {
                    path.extname(css.name).should.equal('.css');
                });
            })
            .catch(function (error) {
                throw error;
            });
    });

    it('should not generate local font files', function () {
        this.timeout(10000);

        fm.outputPath = './test_output';
        fs.removeSync(fm.outputPath);

        return fm.run()
            .then(
                function (files) {
                    // 输入了3个字体，每个3个字体文件
                    files.fonts.length.should.be.equal(3 * 4);

                    // 每个字体一个css文件
                    files.css.length.should.be.equal(3);

                    files.css.forEach(function (css) {
                        path.extname(css.name).should.equal('.css');
                    });

                    (function () {
                        fs.stat(fm.outputPath);
                        fs.removeSync(fm.outputPath);
                    }).should.not.throw(Error);
                },
                function (error) {
                    throw error;
                });
    });
});
