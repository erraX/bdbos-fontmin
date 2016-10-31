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
            text: '江',
            fontFamily: 'xingkai',
        });
    });

    it('without text, should throw error', function () {
        (function () {
            new FmRunner({
                fontFamily: 'myFont'
            });
        }).should.throw(Error);
    });

    it('without fontFamily, should throw error', function () {
        (function () {
            new FmRunner({
                text: '江'
            });
        }).should.throw(Error);
    });

    it('test defaults options', function () {
        fm.debug.should.be.false;
        fm.fontsPath.should.equal('./fonts');
        should.equal(fm.outputPath, null);
        fm.fontTypes.should.eql(['eot', 'ttf', 'svg', 'woff']);
        fm.text.should.equal('江');
        fm.fontFamily.should.equal('xingkai');

        fm.fontmin.should.be.instanceof(Fontmin);

    });

    it('should not generate font files locally', function () {
        this.timeout(10000);

        return fm.run()
            .then(
                function (files) {
                    files.should.have.property('fonts');
                    files.should.have.property('css');

                    files.fonts.length.should.be.equal(4);
                    path.extname(files.css.name).should.equal('.css');
                },
                function (error) {
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
                    files.should.have.property('fonts');
                    files.should.have.property('css');

                    files.fonts.length.should.be.equal(4);
                    path.extname(files.css.name).should.equal('.css');

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
