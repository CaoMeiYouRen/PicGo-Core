"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../../utils/common");
const handle = async (ctx) => {
    const results = ctx.output;
    await Promise.all(ctx.input.map(async (item, index) => {
        let info;
        if (common_1.isUrl(item)) {
            info = await common_1.getURLFile(item);
        }
        else {
            info = await common_1.getFSFile(item);
        }
        if (info.success && info.buffer) {
            try {
                const imgSize = getImgSize(ctx, info.buffer, item);
                results[index] = {
                    buffer: info.buffer,
                    fileName: info.fileName,
                    width: imgSize.width,
                    height: imgSize.height,
                    extname: info.extname
                };
            }
            catch (e) {
                ctx.log.error(e);
            }
        }
        else {
            ctx.log.error(info.reason);
        }
    }));
    // remove empty item
    ctx.output = results.filter(item => item);
    return ctx;
};
const getImgSize = (ctx, file, path) => {
    const imageSize = common_1.getImageSize(file);
    if (!imageSize.real) {
        ctx.log.warn(`can't get ${path}'s image size`);
        ctx.log.warn('fallback to 200 * 200');
    }
    return imageSize;
};
exports.default = {
    handle
};
