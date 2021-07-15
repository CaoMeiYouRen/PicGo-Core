"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const common_1 = require("../utils/common");
const enum_1 = require("../utils/enum");
const createContext_1 = require("../utils/createContext");
class Lifecycle extends events_1.EventEmitter {
    constructor(ctx) {
        super();
        this.ctx = ctx;
    }
    async start(input) {
        // ensure every upload process has an unique context
        const ctx = createContext_1.createContext(this.ctx);
        try {
            // images input
            if (!Array.isArray(input)) {
                throw new Error('Input must be an array.');
            }
            ctx.input = input;
            ctx.output = [];
            // lifecycle main
            await this.beforeTransform(ctx);
            await this.doTransform(ctx);
            await this.beforeUpload(ctx);
            await this.doUpload(ctx);
            await this.afterUpload(ctx);
            return ctx;
        }
        catch (e) {
            ctx.log.warn('failed');
            ctx.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, -1);
            ctx.emit(enum_1.IBuildInEvent.FAILED, e);
            ctx.log.error(e);
            if (ctx.getConfig('debug')) {
                throw e;
            }
            return ctx;
        }
    }
    async beforeTransform(ctx) {
        ctx.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, 0);
        ctx.emit(enum_1.IBuildInEvent.BEFORE_TRANSFORM, ctx);
        ctx.log.info('Before transform');
        await this.handlePlugins(ctx.helper.beforeTransformPlugins, ctx);
        return ctx;
    }
    async doTransform(ctx) {
        ctx.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, 30);
        const type = ctx.getConfig('picBed.transformer') || 'path';
        let currentTransformer = type;
        let transformer = ctx.helper.transformer.get(type);
        if (!transformer) {
            transformer = ctx.helper.transformer.get('path');
            currentTransformer = 'path';
            ctx.log.warn(`Can't find transformer - ${type}, switch to default transformer - path`);
        }
        ctx.log.info(`Transforming... Current transformer is [${currentTransformer}]`);
        await (transformer === null || transformer === void 0 ? void 0 : transformer.handle(ctx));
        return ctx;
    }
    async beforeUpload(ctx) {
        ctx.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, 60);
        ctx.log.info('Before upload');
        ctx.emit(enum_1.IBuildInEvent.BEFORE_UPLOAD, ctx);
        await this.handlePlugins(ctx.helper.beforeUploadPlugins, ctx);
        return ctx;
    }
    async doUpload(ctx) {
        let type = ctx.getConfig('picBed.uploader') || ctx.getConfig('picBed.current') || 'smms';
        let uploader = ctx.helper.uploader.get(type);
        let currentTransformer = type;
        if (!uploader) {
            type = 'smms';
            currentTransformer = 'smms';
            uploader = ctx.helper.uploader.get('smms');
            ctx.log.warn(`Can't find uploader - ${type}, switch to default uploader - smms`);
        }
        ctx.log.info(`Uploading... Current uploader is [${currentTransformer}]`);
        await (uploader === null || uploader === void 0 ? void 0 : uploader.handle(ctx));
        for (const outputImg of ctx.output) {
            outputImg.type = type;
        }
        return ctx;
    }
    async afterUpload(ctx) {
        ctx.emit(enum_1.IBuildInEvent.AFTER_UPLOAD, ctx);
        ctx.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, 100);
        await this.handlePlugins(ctx.helper.afterUploadPlugins, ctx);
        let msg = '';
        const length = ctx.output.length;
        for (let i = 0; i < length; i++) {
            if (typeof ctx.output[i].imgUrl !== 'undefined') {
                msg += common_1.handleUrlEncode(ctx.output[i].imgUrl);
                if (i !== length - 1) {
                    msg += '\n';
                }
            }
            delete ctx.output[i].base64Image;
            delete ctx.output[i].buffer;
        }
        ctx.emit(enum_1.IBuildInEvent.FINISHED, ctx);
        ctx.log.success(`\n${msg}`);
        return ctx;
    }
    async handlePlugins(lifeCyclePlugins, ctx) {
        const plugins = lifeCyclePlugins.getList();
        const pluginNames = lifeCyclePlugins.getIdList();
        const lifeCycleName = lifeCyclePlugins.getName();
        await Promise.all(plugins.map(async (plugin, index) => {
            try {
                ctx.log.info(`${lifeCycleName}: ${pluginNames[index]} running`);
                await plugin.handle(ctx);
            }
            catch (e) {
                ctx.log.error(`${lifeCycleName}: ${pluginNames[index]} error`);
                throw e;
            }
        }));
        return ctx;
    }
}
exports.default = Lifecycle;
