"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const mime_types_1 = __importDefault(require("mime-types"));
const enum_1 = require("../../utils/enum");
// generate OSS signature
const generateSignature = (options, fileName) => {
    const date = new Date().toUTCString();
    const mimeType = mime_types_1.default.lookup(fileName);
    if (!mimeType)
        throw Error(`No mime type found for file ${fileName}`);
    const signString = `PUT\n\n${mimeType}\n${date}\n/${options.bucket}/${options.path}${fileName}`;
    const signature = crypto_1.default.createHmac('sha1', options.accessKeySecret).update(signString).digest('base64');
    return `OSS ${options.accessKeyId}:${signature}`;
};
const postOptions = (options, fileName, signature, image) => {
    return {
        method: 'PUT',
        url: `https://${options.bucket}.${options.area}.aliyuncs.com/${encodeURI(options.path)}${encodeURI(fileName)}`,
        headers: {
            Host: `${options.bucket}.${options.area}.aliyuncs.com`,
            Authorization: signature,
            Date: new Date().toUTCString(),
            'content-type': mime_types_1.default.lookup(fileName)
        },
        body: image,
        resolveWithFullResponse: true
    };
};
const handle = async (ctx) => {
    const aliYunOptions = ctx.getConfig('picBed.aliyun');
    if (!aliYunOptions) {
        throw new Error('Can\'t find aliYun OSS config');
    }
    try {
        const imgList = ctx.output;
        const customUrl = aliYunOptions.customUrl;
        const path = aliYunOptions.path;
        for (const img of imgList) {
            if (img.fileName && img.buffer) {
                const signature = generateSignature(aliYunOptions, img.fileName);
                let image = img.buffer;
                if (!image && img.base64Image) {
                    image = Buffer.from(img.base64Image, 'base64');
                }
                const options = postOptions(aliYunOptions, img.fileName, signature, image);
                const body = await ctx.Request.request(options);
                if (body.statusCode === 200) {
                    delete img.base64Image;
                    delete img.buffer;
                    const optionUrl = aliYunOptions.options || '';
                    if (customUrl) {
                        img.imgUrl = `${customUrl}/${path}${img.fileName}${optionUrl}`;
                    }
                    else {
                        img.imgUrl = `https://${aliYunOptions.bucket}.${aliYunOptions.area}.aliyuncs.com/${path}${img.fileName}${optionUrl}`;
                    }
                }
                else {
                    throw new Error('Upload failed');
                }
            }
        }
        return ctx;
    }
    catch (err) {
        ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
            title: '上传失败',
            body: '请检查你的配置项是否正确'
        });
        throw err;
    }
};
const config = (ctx) => {
    const userConfig = ctx.getConfig('picBed.aliyun') || {};
    const config = [
        {
            name: 'accessKeyId',
            type: 'input',
            default: userConfig.accessKeyId || '',
            required: true
        },
        {
            name: 'accessKeySecret',
            type: 'input',
            default: userConfig.accessKeySecret || '',
            required: true
        },
        {
            name: 'bucket',
            type: 'input',
            default: userConfig.bucket || '',
            required: true
        },
        {
            name: 'area',
            type: 'input',
            default: userConfig.area || '',
            required: true
        },
        {
            name: 'path',
            type: 'input',
            default: userConfig.path || '',
            required: false
        },
        {
            name: 'customUrl',
            type: 'input',
            default: userConfig.customUrl || '',
            required: false
        },
        {
            name: 'options',
            type: 'input',
            default: userConfig.options || '',
            required: false
        }
    ];
    return config;
};
exports.default = {
    name: '阿里云OSS',
    handle,
    config
};
