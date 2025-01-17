"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pluginHandler_1 = __importDefault(require("./pluginHandler"));
const config_1 = __importDefault(require("./config"));
const upload_1 = __importDefault(require("./upload"));
const setting_1 = __importDefault(require("./setting"));
const use_1 = __importDefault(require("./use"));
const proxy_1 = __importDefault(require("./proxy"));
const init_1 = __importDefault(require("./init"));
exports.default = (ctx) => {
    ctx.cmd.register('pluginHandler', pluginHandler_1.default);
    ctx.cmd.register('config', config_1.default);
    ctx.cmd.register('setting', setting_1.default);
    ctx.cmd.register('upload', upload_1.default);
    ctx.cmd.register('use', use_1.default);
    ctx.cmd.register('proxy', proxy_1.default);
    ctx.cmd.register('init', init_1.default);
};
