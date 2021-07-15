"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const enum_1 = require("../utils/enum");
const eventBus_1 = require("../utils/eventBus");
class Request {
    constructor(ctx) {
        this.proxy = '';
        this.options = {};
        this.ctx = ctx;
        this.init();
        eventBus_1.eventBus.on(enum_1.IBusEvent.CONFIG_CHANGE, (data) => {
            var _a;
            switch (data.configName) {
                case 'picBed':
                    if ((_a = data.value) === null || _a === void 0 ? void 0 : _a.proxy) {
                        this.proxy = data.value.proxy;
                    }
                    break;
                case 'picBed.proxy':
                    this.proxy = data.value;
                    break;
            }
        });
    }
    init() {
        const proxy = this.ctx.getConfig('picBed.proxy');
        if (proxy) {
            this.proxy = proxy;
        }
    }
    // #64 dynamic get proxy value
    get request() {
        // remove jar because we don't need anymore
        this.options.proxy = this.proxy || undefined;
        return request_promise_native_1.default.defaults(this.options);
    }
}
exports.default = Request;
