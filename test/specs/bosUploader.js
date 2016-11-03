var path = require('path');
var chai = require('chai');
var should = chai.should();

var bce = require('baidubce-sdk');
var BosUploader = require('../../lib/BosUploader');

describe('BosUploader', function () {
    var bosUploader;

    beforeEach(function () {
        bosUploader = new BosUploader({
            bosConfig: {
                credentials: {
                    ak: 'fc35e789187047bf930a9b085a328566',
                    sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                },
                endpoint: 'http://bj.bcebos.com'
            },
            bucket: 'laser',
            fontPrefix: '/lasertest/static/public/fonts',
            cssPrefix: '/lasertest/static/public/css',
        });
    });

    it('without fontPrefix, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        ak: 'fc35e789187047bf930a9b085a328566',
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                bucket: 'laser',
                cssPrefix: '/lasertest/static/public/css',
            });
        }).should.throw(Error);
    });

    it('without cssPrefix, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        ak: 'fc35e789187047bf930a9b085a328566',
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                bucket: 'laser',
                fontPrefix: '/lasertest/static/public/fonts'
            });
        }).should.throw(Error);
    });

    it('without bucket, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        ak: 'fc35e789187047bf930a9b085a328566',
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                prefix: '/lasertest/static/public/fonts'
            });
        }).should.throw(Error);
    });

    it('without bosConfig, should throw error', function () {
        (function () {
            new BosUploader({
                prefix: '/lasertest/static/public/fonts',
                bucket: 'laser'
            });
        }).should.throw(Error);
    });

    it('without bosConfig.credentials, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    endpoint: 'http://bj.bcebos.com'
                },
                prefix: '/lasertest/static/public/fonts',
                bucket: 'laser'
            });
        }).should.throw(Error);
    });

    it('without bosConfig.endpoint, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        ak: 'fc35e789187047bf930a9b085a328566',
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    }
                },
                prefix: '/lasertest/static/public/fonts',
                bucket: 'laser'
            });
        }).should.throw(Error);
    });

    it('without bosConfig.credentials.ak, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                prefix: '/lasertest/static/public/fonts',
                bucket: 'laser'
            });
        }).should.throw(Error);
    });

    it('without bosConfig.credentials.sk, should throw error', function () {
        (function () {
            new BosUploader({
                bosConfig: {
                    credentials: {
                        sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
                    },
                    endpoint: 'http://bj.bcebos.com'
                },
                prefix: '/lasertest/static/public/fonts',
                bucket: 'laser'
            });
        }).should.throw(Error);
    });

    it('should initial config to self', function () {
        should.not.exist(bosUploader.debug);
        bosUploader.fontPrefix.should.equal('/lasertest/static/public/fonts');
        bosUploader.cssPrefix.should.equal('/lasertest/static/public/css');
        bosUploader.bucket.should.equal('laser');
        bosUploader.bosConfig.should.eql({
            credentials: {
                ak: 'fc35e789187047bf930a9b085a328566',
                sk: 'd9fa68c0a9724a4f82155fe7a10d98a0'
            },
            endpoint: 'http://bj.bcebos.com'
        });
    });

    it('should initial bos client', function () {
        bosUploader.client.should.be.an.instanceof(bce.BosClient);
    });
});
