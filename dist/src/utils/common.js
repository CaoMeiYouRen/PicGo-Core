"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInputConfigValid = exports.isConfigKeyInBlackList = exports.configBlackList = exports.removePluginVersion = exports.handleUnixStylePath = exports.getNormalPluginName = exports.getProcessPluginName = exports.handleCompletePluginName = exports.handleStreamlinePluginName = exports.isSimpleName = exports.getPluginNameType = exports.getURLFile = exports.getFSFile = exports.getImageSize = exports.handleUrlEncode = exports.isUrlEncode = exports.isUrl = void 0;
const request_promise_native_1 = __importDefault(require("request-promise-native"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const image_size_1 = require("image-size");
const url_1 = require("url");
exports.isUrl = (url) => (url.startsWith('http://') || url.startsWith('https://'));
exports.isUrlEncode = (url) => {
    url = url || '';
    try {
        return url !== decodeURI(url);
    }
    catch (e) {
        // if some error caught, try to let it go
        return true;
    }
};
exports.handleUrlEncode = (url) => {
    if (!exports.isUrlEncode(url)) {
        url = encodeURI(url);
    }
    return url;
};
exports.getImageSize = (file) => {
    try {
        const { width = 0, height = 0 } = image_size_1.imageSize(file);
        return {
            real: true,
            width,
            height
        };
    }
    catch (e) {
        // fallback to 200 * 200
        return {
            real: false,
            width: 200,
            height: 200
        };
    }
};
exports.getFSFile = async (filePath) => {
    try {
        return {
            extname: path_1.default.extname(filePath),
            fileName: path_1.default.basename(filePath),
            buffer: await fs_extra_1.default.readFile(filePath),
            success: true
        };
    }
    catch (_a) {
        return {
            reason: `read file ${filePath} error`,
            success: false
        };
    }
};
exports.getURLFile = async (url) => {
    const requestOptions = {
        method: 'GET',
        url: exports.handleUrlEncode(url),
        encoding: null
    };
    let isImage = false;
    let extname = '';
    let timeoutId;
    // tslint:disable-next-line: typedef
    const requestFn = new Promise((resolve, reject) => {
        (async () => {
            try {
                const res = await request_promise_native_1.default(requestOptions)
                    .on('response', (response) => {
                    const contentType = response.headers['content-type'];
                    if (contentType === null || contentType === void 0 ? void 0 : contentType.includes('image')) {
                        isImage = true;
                        extname = `.${contentType.split('image/')[1]}`;
                    }
                });
                clearTimeout(timeoutId);
                if (isImage) {
                    const urlPath = new url_1.URL(requestOptions.url).pathname;
                    resolve({
                        buffer: res,
                        fileName: path_1.default.basename(urlPath),
                        extname,
                        success: true
                    });
                }
                else {
                    resolve({
                        success: false,
                        reason: `${url} is not image`
                    });
                }
            }
            catch (_a) {
                clearTimeout(timeoutId);
                resolve({
                    success: false,
                    reason: `request ${url} error`
                });
            }
        })().catch(reject);
    });
    // tslint:disable-next-line: typedef
    const timeoutPromise = new Promise((resolve) => {
        timeoutId = setTimeout(() => {
            resolve({
                success: false,
                reason: `request ${url} timeout`
            });
        }, 10000);
    });
    return Promise.race([requestFn, timeoutPromise]);
};
/**
 * detect the input string's type
 * for example
 * 1. @xxx/picgo-plugin-xxx -> scope
 * 2. picgo-plugin-xxx -> normal
 * 3. xxx -> simple
 * 4. not exists or is a path -> unknown
 * @param name
 */
exports.getPluginNameType = (name) => {
    if (/^@[^/]+\/picgo-plugin-/.test(name)) {
        return 'scope';
    }
    else if (name.startsWith('picgo-plugin-')) {
        return 'normal';
    }
    else if (exports.isSimpleName(name)) {
        return 'simple';
    }
    return 'unknown';
};
/**
 * detect the input string is a simple plugin name or not
 * for example
 * 1. xxx -> true
 * 2. /Usr/xx/xxxx/picgo-plugin-xxx -> false
 * @param name pluginNameOrPath
 */
exports.isSimpleName = (nameOrPath) => {
    if (path_1.default.isAbsolute(nameOrPath)) {
        return false;
    }
    const pluginPath = path_1.default.join(process.cwd(), nameOrPath);
    if (fs_extra_1.default.existsSync(pluginPath)) {
        return false;
    }
    if (nameOrPath.includes('/') || nameOrPath.includes('\\')) {
        return false;
    }
    return true;
};
/**
 * streamline the full plugin name to a simple one
 * for example:
 * 1. picgo-plugin-xxx -> xxx
 * 2. @xxx/picgo-plugin-yyy -> yyy
 * @param name pluginFullName
 */
exports.handleStreamlinePluginName = (name) => {
    if (/^@[^/]+\/picgo-plugin-/.test(name)) {
        return name.replace(/^@[^/]+\/picgo-plugin-/, '');
    }
    else {
        return name.replace(/picgo-plugin-/, '');
    }
};
/**
 * complete plugin name to full name
 * for example:
 * 1. xxx -> picgo-plugin-xxx
 * 2. picgo-plugin-xxx -> picgo-plugin-xxx
 * @param name pluginSimpleName
 * @param scope pluginScope
 */
exports.handleCompletePluginName = (name, scope = '') => {
    if (scope) {
        return `@${scope}/picgo-plugin-${name}`;
    }
    else {
        return `picgo-plugin-${name}`;
    }
};
/**
 * handle install/uninstall/update plugin name or path
 * for example
 * 1. picgo-plugin-xxx -> picgo-plugin-xxx
 * 2. @xxx/picgo-plugin-xxx -> @xxx/picgo-plugin-xxx
 * 3. xxx -> picgo-plugin-xxx
 * 4. ./xxxx/picgo-plugin-xxx -> /absolutePath/.../xxxx/picgo-plugin-xxx
 * 5. /absolutePath/.../picgo-plugin-xxx -> /absolutePath/.../picgo-plugin-xxx
 * @param nameOrPath pluginName or pluginPath
 */
exports.getProcessPluginName = (nameOrPath, logger = console) => {
    const pluginNameType = exports.getPluginNameType(nameOrPath);
    switch (pluginNameType) {
        case 'normal':
        case 'scope':
            return nameOrPath;
        case 'simple':
            return exports.handleCompletePluginName(nameOrPath);
        default: {
            // now, the pluginNameType is unknow here
            // 1. check if is an absolute path
            let pluginPath = nameOrPath;
            if (path_1.default.isAbsolute(nameOrPath) && fs_extra_1.default.existsSync(nameOrPath)) {
                return exports.handleUnixStylePath(pluginPath);
            }
            // 2. check if is a relative path
            pluginPath = path_1.default.join(process.cwd(), nameOrPath);
            if (fs_extra_1.default.existsSync(pluginPath)) {
                return exports.handleUnixStylePath(pluginPath);
            }
            // 3. invalid nameOrPath
            logger.warn(`Can't find plugin ${nameOrPath}`);
            return '';
        }
    }
};
/**
 * get the normal plugin name
 * for example:
 * 1. picgo-plugin-xxx -> picgo-plugin-xxx
 * 2. @xxx/picgo-plugin-xxx -> @xxx/picgo-plugin-xxx
 * 3. ./xxxx/picgo-plugin-xxx -> picgo-plugin-xxx
 * 4. /absolutePath/.../picgo-plugin-xxx -> picgo-plugin-xxx
 * 5. an exception: [package.json's name] !== [folder name]
 * then use [package.json's name], usually match the scope package.
 * 6. if plugin name has version: picgo-plugin-xxx@x.x.x then remove the version
 * @param nameOrPath
 */
exports.getNormalPluginName = (nameOrPath, logger = console) => {
    var _a;
    const pluginNameType = exports.getPluginNameType(nameOrPath);
    switch (pluginNameType) {
        case 'normal':
            return exports.removePluginVersion(nameOrPath);
        case 'scope':
            return exports.removePluginVersion(nameOrPath, true);
        case 'simple':
            return exports.removePluginVersion(exports.handleCompletePluginName(nameOrPath));
        default: {
            // now, the nameOrPath must be path
            // the nameOrPath here will be ensured with unix style
            // we need to find the package.json's name cause npm using the name in package.json's name filed
            if (!fs_extra_1.default.existsSync(nameOrPath)) {
                logger.warn(`Can't find plugin: ${nameOrPath}`);
                return '';
            }
            const packageJSONPath = path_1.default.posix.join(nameOrPath, 'package.json');
            if (!fs_extra_1.default.existsSync(packageJSONPath)) {
                logger.warn(`Can't find plugin: ${nameOrPath}`);
                return '';
            }
            else {
                const pkg = fs_extra_1.default.readJSONSync(packageJSONPath) || {};
                if (!((_a = pkg.name) === null || _a === void 0 ? void 0 : _a.includes('picgo-plugin-'))) {
                    logger.warn(`The plugin package.json's name filed is ${pkg.name || 'empty'}, need to include the prefix: picgo-plugin-`);
                    return '';
                }
                return pkg.name;
            }
        }
    }
};
/**
 * handle transform the path to unix style
 * for example
 * 1. C:\\xxx\\xxx -> C:/xxx/xxx
 * 2. /xxx/xxx -> /xxx/xxx
 * @param path
 */
exports.handleUnixStylePath = (pathStr) => {
    const pathArr = pathStr.split(path_1.default.sep);
    return pathArr.join('/');
};
/**
 * remove plugin version when register plugin name
 * 1. picgo-plugin-xxx@1.0.0 -> picgo-plugin-xxx
 * 2. @xxx/picgo-plugin-xxx@1.0.0 -> @xxx/picgo-plugin-xxx
 * @param nameOrPath
 * @param scope
 */
exports.removePluginVersion = (nameOrPath, scope = false) => {
    if (!nameOrPath.includes('@')) {
        return nameOrPath;
    }
    else {
        let reg = /(.+\/)?(picgo-plugin-\w+)(@.+)*/;
        // if is a scope pkg
        if (scope) {
            reg = /(.+\/)?(^@[^/]+\/picgo-plugin-\w+)(@.+)*/;
        }
        const matchArr = nameOrPath.match(reg);
        if (!matchArr) {
            console.warn('can not remove plugin version');
            return nameOrPath;
        }
        else {
            return matchArr[2];
        }
    }
};
/**
 * the config black item list which won't be setted
 * only can be got
 */
exports.configBlackList = ['uploaded'];
/**
 * check some config key is in blackList
 * @param key
 */
exports.isConfigKeyInBlackList = (key) => {
    return exports.configBlackList.some(blackItem => key.startsWith(blackItem));
};
/**
 * check the input config is valid
 * config must be object such as { xxx: 'xxx' }
 * && can't be array
 * @param config
 * @returns
 */
exports.isInputConfigValid = (config) => {
    if (typeof config === 'object' &&
        !Array.isArray(config) &&
        Object.keys(config).length > 0) {
        return true;
    }
    return false;
};
// hold...
// export const configWhiteList: RegExp[] = [
//   /^picBed/,
//   /^picgoPlugins/,
//   /^@[^/]+\/picgo-plugin-/,
//   /debug/,
//   /silent/,
//   /configPath/,
//   /^settings/,
//   /PICGO_ENV/
// ]
// export const isConfigKeyInWhiteList = (key: string): boolean => {
//   return configWhiteList.some(whiteItem => whiteItem.test(key))
// }
