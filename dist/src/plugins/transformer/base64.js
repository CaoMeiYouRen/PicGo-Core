"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handle = async (ctx) => {
    ctx.output.push(...ctx.input);
    return ctx;
};
exports.default = {
    handle
};