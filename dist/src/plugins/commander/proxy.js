"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const proxy = {
    handle: (ctx) => {
        const cmd = ctx.cmd;
        cmd.program
            .option('-p, --proxy <url>', 'set proxy for uploading', (proxy) => {
            ctx.setConfig({
                'picBed.proxy': proxy
            });
        });
    }
};
exports.default = proxy;
