"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const qiniu_1 = __importDefault(require("qiniu"));
const enum_1 = require("../../utils/enum");
function postOptions(options, fileName, token, imgBase64) {
    const area = selectArea(options.area || 'z0');
    const path = options.path || '';
    const base64FileName = Buffer.from(path + fileName, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_');
    return {
        method: 'POST',
        url: `http://upload${area}.qiniu.com/putb64/-1/key/${base64FileName}`,
        headers: {
            Authorization: `UpToken ${token}`,
            contentType: 'application/octet-stream'
        },
        body: imgBase64
    };
}
function selectArea(area) {
    return area === 'z0' ? '' : '-' + area;
}
function getToken(qiniuOptions) {
    const accessKey = qiniuOptions.accessKey;
    const secretKey = qiniuOptions.secretKey;
    const mac = new qiniu_1.default.auth.digest.Mac(accessKey, secretKey);
    const options = {
        scope: qiniuOptions.bucket
    };
    const putPolicy = new qiniu_1.default.rs.PutPolicy(options);
    return putPolicy.uploadToken(mac);
}
const handle = async (ctx) => {
    const qiniuOptions = ctx.getConfig('picBed.qiniu');
    if (!qiniuOptions) {
        throw new Error('Can\'t find qiniu config');
    }
    try {
        const imgList = ctx.output;
        for (const img of imgList) {
            if (img.fileName && img.buffer) {
                const base64Image = img.base64Image || Buffer.from(img.buffer).toString('base64');
                const options = postOptions(qiniuOptions, img.fileName, getToken(qiniuOptions), base64Image);
                const res = await ctx.Request.request(options);
                const body = JSON.parse(res);
                if (body === null || body === void 0 ? void 0 : body.key) {
                    delete img.base64Image;
                    delete img.buffer;
                    const baseUrl = qiniuOptions.url;
                    const options = qiniuOptions.options;
                    img.imgUrl = `${baseUrl}/${body.key}${options}`;
                }
                else {
                    ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                        title: '上传失败',
                        body: res.body.msg
                    });
                    throw new Error('Upload failed');
                }
            }
        }
        return ctx;
    }
    catch (err) {
        if (err.message !== 'Upload failed') {
            // err.response maybe undefined
            if (err.response) {
                const error = JSON.parse(err.response.body || '{}');
                ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                    title: '上传失败',
                    body: error.error
                });
            }
        }
        throw err;
    }
};
const config = (ctx) => {
    const userConfig = ctx.getConfig('picBed.qiniu') || {};
    const config = [
        {
            name: 'accessKey',
            type: 'input',
            default: userConfig.accessKey || '',
            required: true
        },
        {
            name: 'secretKey',
            type: 'input',
            default: userConfig.secretKey || '',
            required: true
        },
        {
            name: 'bucket',
            type: 'input',
            default: userConfig.bucket || '',
            required: true
        },
        {
            name: 'url',
            type: 'input',
            default: userConfig.url || '',
            required: true
        },
        {
            name: 'area',
            type: 'input',
            default: userConfig.area || '',
            required: true
        },
        {
            name: 'options',
            type: 'input',
            default: userConfig.options || '',
            required: false
        },
        {
            name: 'path',
            type: 'input',
            default: userConfig.path || '',
            required: false
        }
    ];
    return config;
};
exports.default = {
    name: '七牛图床',
    handle,
    config
};
