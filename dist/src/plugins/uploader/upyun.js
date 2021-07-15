"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const md5_1 = __importDefault(require("md5"));
const enum_1 = require("../../utils/enum");
// generate COS signature string
const generateSignature = (options, fileName) => {
    const path = options.path || '';
    const operator = options.operator;
    const password = options.password;
    const md5Password = md5_1.default(password);
    const date = new Date().toUTCString();
    const uri = `/${options.bucket}/${encodeURI(path)}${encodeURI(fileName)}`;
    const value = `PUT&${uri}&${date}`;
    const sign = crypto_1.default.createHmac('sha1', md5Password).update(value).digest('base64');
    return `UPYUN ${operator}:${sign}`;
};
const postOptions = (options, fileName, signature, image) => {
    const bucket = options.bucket;
    const path = options.path || '';
    return {
        method: 'PUT',
        url: `https://v0.api.upyun.com/${bucket}/${encodeURI(path)}${encodeURI(fileName)}`,
        headers: {
            Authorization: signature,
            Date: new Date().toUTCString()
        },
        body: image,
        resolveWithFullResponse: true
    };
};
const handle = async (ctx) => {
    const upyunOptions = ctx.getConfig('picBed.upyun');
    if (!upyunOptions) {
        throw new Error('Can\'t find upYun config');
    }
    try {
        const imgList = ctx.output;
        const path = upyunOptions.path || '';
        for (const img of imgList) {
            if (img.fileName && img.buffer) {
                let image = img.buffer;
                if (!image && img.base64Image) {
                    image = Buffer.from(img.base64Image, 'base64');
                }
                const signature = generateSignature(upyunOptions, img.fileName);
                const options = postOptions(upyunOptions, img.fileName, signature, image);
                const body = await ctx.Request.request(options);
                if (body.statusCode === 200) {
                    delete img.base64Image;
                    delete img.buffer;
                    img.imgUrl = `${upyunOptions.url}/${path}${img.fileName}${upyunOptions.options}`;
                }
                else {
                    throw new Error('Upload failed');
                }
            }
        }
        return ctx;
    }
    catch (err) {
        if (err.message === 'Upload failed') {
            ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                title: '上传失败',
                body: '请检查你的配置项是否正确'
            });
        }
        else {
            const body = JSON.parse(err.error);
            ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                title: '上传失败',
                body: `错误码：${body.code}，请打开浏览器粘贴地址查看相关原因`,
                text: 'http://docs.upyun.com/api/errno/'
            });
        }
        throw err;
    }
};
const config = (ctx) => {
    const userConfig = ctx.getConfig('picBed.upyun') || {};
    const config = [
        {
            name: 'bucket',
            type: 'input',
            default: userConfig.bucket || '',
            required: true
        },
        {
            name: 'operator',
            type: 'input',
            default: userConfig.operator || '',
            required: true
        },
        {
            name: 'password',
            type: 'password',
            default: userConfig.password || '',
            required: true
        },
        {
            name: 'url',
            type: 'input',
            default: userConfig.url || '',
            required: true
        },
        {
            name: 'options',
            type: 'input',
            default: userConfig.options || '',
            required: true
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
    name: '又拍云图床',
    handle,
    config
};
