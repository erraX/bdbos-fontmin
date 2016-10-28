var chai = require('chai');
var fontmin = require('../lib/fontminRunner');

var should = chai.should();

describe('fontmin', function () {

    it('without text, should throw error', function () {
        var fn = function () {
            fontmin({
                fontFamily: 'myFont'
            });
        };

        fn.should.throw(/ must be pass in fontmin runner/);
    });

    it('without fontFamily, should throw error', function () {
        var fn = function () {
            fontmin({
                text: '江'
            });
        };

        fn.should.throw(/ must be pass in fontmin runner/);
    });

    it('should output font', function () {
        return fontmin({
            text: '江',
            fontFamily: 'xingkai',
        })
        .then(function (files, stream) {
            files.length.should.be.equal(5);
        });
    });

    it('should output font', function () {
        return fontmin({
            text: '江',
            fontFamily: 'xingkai',
            outputPath: './output'
        })
        .then(function (files, stream) {
            files.length.should.be.equal(5);
        });
    });
});
