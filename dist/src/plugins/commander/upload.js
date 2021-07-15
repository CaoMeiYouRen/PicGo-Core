"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const common_1 = require("../../utils/common");
const upload = {
    handle: (ctx) => {
        const cmd = ctx.cmd;
        cmd.program
            .command('upload')
            .description('upload, go go go')
            .arguments('[input...]')
            .alias('u')
            .action((input) => {
            (async () => {
                const inputList = input
                    .map((item) => {
                    return common_1.isUrl(item) ? item : path_1.default.resolve(item);
                })
                    .filter((item) => {
                    const exist = fs_extra_1.default.existsSync(item) || common_1.isUrl(item);
                    if (!exist) {
                        ctx.log.warn(`${item} does not exist.`);
                    }
                    return exist;
                });
                await ctx.upload(inputList);
            })().catch((e) => { ctx.log.error(e); });
        });
    }
};
exports.default = upload;
