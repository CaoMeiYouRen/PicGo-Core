"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("./path"));
const base64_1 = __importDefault(require("./base64"));
const buildInTransformers = () => {
    return {
        register(ctx) {
            ctx.helper.transformer.register('path', path_1.default);
            ctx.helper.transformer.register('base64', base64_1.default);
        }
    };
};
exports.default = buildInTransformers;
