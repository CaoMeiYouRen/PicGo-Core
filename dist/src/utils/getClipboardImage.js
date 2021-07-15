"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const dayjs_1 = __importDefault(require("dayjs"));
const os_1 = __importDefault(require("os"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const enum_1 = require("./enum");
const getCurrentPlatform = () => {
    const platform = process.platform;
    if (platform !== 'win32') {
        return platform;
    }
    else {
        const currentOS = os_1.default.release().split('.')[0];
        if (currentOS === '10') {
            return 'win10';
        }
        else {
            return 'win32';
        }
    }
};
// Thanks to vs-picgo: https://github.com/Spades-S/vs-picgo/blob/master/src/extension.ts
const getClipboardImage = async (ctx) => {
    const imagePath = path_1.default.join(ctx.baseDir, `${dayjs_1.default().format('YYYYMMDDHHmmss')}.png`);
    return await new Promise((resolve) => {
        const platform = getCurrentPlatform();
        let execution;
        // for PicGo GUI
        const env = ctx.getConfig('PICGO_ENV') === 'GUI';
        const platformPaths = {
            darwin: env ? path_1.default.join(ctx.baseDir, 'mac.applescript') : './clipboard/mac.applescript',
            win32: env ? path_1.default.join(ctx.baseDir, 'windows.ps1') : './clipboard/windows.ps1',
            win10: env ? path_1.default.join(ctx.baseDir, 'windows10.ps1') : './clipboard/windows10.ps1',
            linux: env ? path_1.default.join(ctx.baseDir, 'linux.sh') : './clipboard/linux.sh'
        };
        const scriptPath = env ? platformPaths[platform] : path_1.default.join(__dirname, platformPaths[platform]);
        if (platform === 'darwin') {
            execution = child_process_1.spawn('osascript', [scriptPath, imagePath]);
        }
        else if (platform === 'win32' || platform === 'win10') {
            execution = child_process_1.spawn('powershell', [
                '-noprofile',
                '-noninteractive',
                '-nologo',
                '-sta',
                '-executionpolicy', 'unrestricted',
                // fix windows 10 native cmd crash bug when "picgo upload"
                // https://github.com/PicGo/PicGo-Core/issues/32
                // '-windowstyle','hidden',
                // '-noexit',
                '-file', scriptPath,
                imagePath
            ]);
        }
        else {
            execution = child_process_1.spawn('sh', [scriptPath, imagePath]);
        }
        execution.stdout.on('data', (data) => {
            if (platform === 'linux') {
                if (data.toString().trim() === 'no xclip') {
                    return ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                        title: 'xclip not found',
                        body: 'Please install xclip before run picgo'
                    });
                }
            }
            const imgPath = data.toString().trim();
            let isExistFile = false;
            // in macOS if your copy the file in system, it's basename will not equal to our default basename
            if (path_1.default.basename(imgPath) !== path_1.default.basename(imagePath)) {
                if (fs_extra_1.default.existsSync(imgPath)) {
                    isExistFile = true;
                }
            }
            resolve({
                imgPath,
                isExistFile
            });
        });
    });
};
exports.default = getClipboardImage;
