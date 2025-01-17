"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const smms_1 = __importDefault(require("./smms"));
const tcyun_1 = __importDefault(require("./tcyun"));
const github_1 = __importDefault(require("./github"));
const qiniu_1 = __importDefault(require("./qiniu"));
const imgur_1 = __importDefault(require("./imgur"));
const aliyun_1 = __importDefault(require("./aliyun"));
const upyun_1 = __importDefault(require("./upyun"));
const buildInUploaders = () => {
    return {
        register(ctx) {
            ctx.helper.uploader.register('smms', smms_1.default);
            ctx.helper.uploader.register('tcyun', tcyun_1.default);
            ctx.helper.uploader.register('github', github_1.default);
            ctx.helper.uploader.register('qiniu', qiniu_1.default);
            ctx.helper.uploader.register('imgur', imgur_1.default);
            ctx.helper.uploader.register('aliyun', aliyun_1.default);
            ctx.helper.uploader.register('upyun', upyun_1.default);
        }
    };
};
exports.default = buildInUploaders;
