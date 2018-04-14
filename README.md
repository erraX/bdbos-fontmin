# bdbos-fontmin
输入中文字，输出字体文件子集与CSS定义，减少字体文件体积，加快加载速度。

## Usage

``` javascript
import BosFontmin from 'bdbos-fontmin';

const hash = 'hash';

// 初始化配置
const bosFontmin = new BosFontmin();

// 这个必须一开始就注册
bosFontmin.register('fontmin', {
    hash,
    fontsPath: 'font/path/to/upload',
    texts: convertFontFormat(font),
});

// 处理css，替换路径等
bosFontmin.register('css', {
    fileName: `font.${hash}.css`,
    '/font/prefix',
    '/css/prefix',
    host: 'xxx.bos.com',
    protocol: 'https'
});

// 最后再上传所有文件
bosFontmin.register('bos', {
    '/font/prefix',
    '/css/prefix',
    bosConfig: {
        ak: 'ak',
        sk: 'sdk',
        endpoint: 'http://xxx.bcebos.com'
    },
    bucket: 'bucket'
});

// 开始转换
bosFontmin.run()
    .then(function (files) {
        console.log(files);
        next();
    })
    .catch(
        function (error) {
            console.error(new Error(JSON.stringify(error)));
            next(error);
        }
    );
```
