"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const enum_1 = require("../../utils/enum");
const postOptions = (fileName, options, data) => {
    const path = options.path || '';
    const { token, repo } = options;
    return {
        method: 'PUT',
        url: `https://api.github.com/repos/${repo}/contents/${encodeURI(path)}${encodeURI(fileName)}`,
        headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'PicGo'
        },
        body: data,
        json: true
    };
};
const handle = async (ctx) => {
    const githubOptions = ctx.getConfig('picBed.github');
    if (!githubOptions) {
        throw new Error('Can\'t find github config');
    }
    try {
        const imgList = ctx.output;
        for (const img of imgList) {
            if (img.fileName && img.buffer) {
                const base64Image = img.base64Image || Buffer.from(img.buffer).toString('base64');
                const data = {
                    message: 'Upload by PicGo',
                    branch: githubOptions.branch,
                    content: base64Image,
                    path: githubOptions.path + encodeURI(img.fileName)
                };
                const postConfig = postOptions(img.fileName, githubOptions, data);
                const body = await ctx.Request.request(postConfig);
                if (body) {
                    delete img.base64Image;
                    delete img.buffer;
                    if (githubOptions.customUrl) {
                        img.imgUrl = `${githubOptions.customUrl}/${githubOptions.path}${img.fileName}`;
                    }
                    else {
                        img.imgUrl = body.content.download_url;
                    }
                }
                else {
                    throw new Error('Server error, please try again');
                }
            }
        }
        return ctx;
    }
    catch (err) {
        ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
            title: '上传失败',
            body: '服务端出错，请重试'
        });
        throw err;
    }
};
const config = (ctx) => {
    const userConfig = ctx.getConfig('picBed.github') || {};
    const config = [
        {
            name: 'repo',
            type: 'input',
            default: userConfig.repo || '',
            required: true
        },
        {
            name: 'branch',
            type: 'input',
            default: userConfig.branch || 'master',
            required: true
        },
        {
            name: 'token',
            type: 'input',
            default: userConfig.token || '',
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
        }
    ];
    return config;
};
exports.default = {
    name: 'GitHub图床',
    handle,
    config
};
