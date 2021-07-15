"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    handle: (ctx) => {
        const cmd = ctx.cmd;
        cmd.program
            .option('-c, --config <path>', 'set config path');
        // will handle in `bin/picgo`
    }
};
exports.default = config;
