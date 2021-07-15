"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const dayjs_1 = __importDefault(require("dayjs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const enum_1 = require("../utils/enum");
class Logger {
    constructor(ctx) {
        this.level = {
            [enum_1.ILogType.success]: 'green',
            [enum_1.ILogType.info]: 'blue',
            [enum_1.ILogType.warn]: 'yellow',
            [enum_1.ILogType.error]: 'red'
        };
        this.ctx = ctx;
    }
    handleLog(type, ...msg) {
        // check config.silent
        if (!this.ctx.getConfig('silent')) {
            const logHeader = chalk_1.default[this.level[type]](`[PicGo ${type.toUpperCase()}]:`);
            console.log(logHeader, ...msg);
            this.logLevel = this.ctx.getConfig('settings.logLevel');
            this.logPath = this.ctx.getConfig('settings.logPath') || path_1.default.join(this.ctx.baseDir, './picgo.log');
            setTimeout(() => {
                this.handleWriteLog(this.logPath, type, ...msg);
            }, 0);
        }
    }
    handleWriteLog(logPath, type, ...msg) {
        try {
            if (this.checkLogLevel(type, this.logLevel)) {
                let log = `${dayjs_1.default().format('YYYY-MM-DD HH:mm:ss')} [PicGo ${type.toUpperCase()}] `;
                msg.forEach((item) => {
                    if (typeof item === 'object' && type === 'error') {
                        log += `\n------Error Stack Begin------\n${util_1.default.format(item.stack)}\n-------Error Stack End------- `;
                    }
                    else {
                        if (typeof item === 'object') {
                            item = JSON.stringify(item);
                        }
                        log += `${item} `;
                    }
                });
                log += '\n';
                // A synchronized approach to avoid log msg sequence errors
                fs_extra_1.default.appendFileSync(logPath, log);
            }
        }
        catch (e) {
            console.log(e);
        }
    }
    checkLogLevel(type, level) {
        if (level === undefined || level === 'all') {
            return true;
        }
        if (Array.isArray(level)) {
            return level.some((item) => (item === type || item === 'all'));
        }
        else {
            return type === level;
        }
    }
    success(...msg) {
        return this.handleLog(enum_1.ILogType.success, ...msg);
    }
    info(...msg) {
        return this.handleLog(enum_1.ILogType.info, ...msg);
    }
    error(...msg) {
        return this.handleLog(enum_1.ILogType.error, ...msg);
    }
    warn(...msg) {
        return this.handleLog(enum_1.ILogType.warn, ...msg);
    }
}
exports.default = Logger;
