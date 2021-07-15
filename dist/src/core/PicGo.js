"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const events_1 = require("events");
const os_1 = require("os");
const Commander_1 = __importDefault(require("../lib/Commander"));
const Logger_1 = __importDefault(require("../lib/Logger"));
const Lifecycle_1 = __importDefault(require("./Lifecycle"));
const LifecyclePlugins_1 = __importStar(require("../lib/LifecyclePlugins"));
const uploader_1 = __importDefault(require("../plugins/uploader"));
const transformer_1 = __importDefault(require("../plugins/transformer"));
const PluginLoader_1 = __importDefault(require("../lib/PluginLoader"));
const lodash_1 = require("lodash");
const getClipboardImage_1 = __importDefault(require("../utils/getClipboardImage"));
const Request_1 = __importDefault(require("../lib/Request"));
const db_1 = __importDefault(require("../utils/db"));
const PluginHandler_1 = __importDefault(require("../lib/PluginHandler"));
const enum_1 = require("../utils/enum");
const package_json_1 = require("../../package.json");
const eventBus_1 = require("../utils/eventBus");
const common_1 = require("../utils/common");
class PicGo extends events_1.EventEmitter {
    constructor(configPath = '') {
        super();
        this.VERSION = package_json_1.version;
        this.configPath = configPath;
        this.output = [];
        this.input = [];
        this.helper = {
            transformer: new LifecyclePlugins_1.default('transformer'),
            uploader: new LifecyclePlugins_1.default('uploader'),
            beforeTransformPlugins: new LifecyclePlugins_1.default('beforeTransformPlugins'),
            beforeUploadPlugins: new LifecyclePlugins_1.default('beforeUploadPlugins'),
            afterUploadPlugins: new LifecyclePlugins_1.default('afterUploadPlugins')
        };
        this.initConfigPath();
        this.log = new Logger_1.default(this);
        this.cmd = new Commander_1.default(this);
        this.pluginHandler = new PluginHandler_1.default(this);
        this.initConfig();
        this.init();
    }
    get pluginLoader() {
        return this._pluginLoader;
    }
    initConfigPath() {
        if (this.configPath === '') {
            this.configPath = os_1.homedir() + '/.picgo/config.json';
        }
        if (path_1.default.extname(this.configPath).toUpperCase() !== '.JSON') {
            this.configPath = '';
            throw Error('The configuration file only supports JSON format.');
        }
        this.baseDir = path_1.default.dirname(this.configPath);
        const exist = fs_extra_1.default.pathExistsSync(this.configPath);
        if (!exist) {
            fs_extra_1.default.ensureFileSync(`${this.configPath}`);
        }
    }
    initConfig() {
        this.db = new db_1.default(this);
        this._config = this.db.read().value();
    }
    init() {
        try {
            this.Request = new Request_1.default(this);
            this._pluginLoader = new PluginLoader_1.default(this);
            // load self plugins
            LifecyclePlugins_1.setCurrentPluginName('picgo');
            uploader_1.default(this).register(this);
            transformer_1.default(this).register(this);
            LifecyclePlugins_1.setCurrentPluginName('');
            // load third-party plugins
            this._pluginLoader.load();
            this.lifecycle = new Lifecycle_1.default(this);
        }
        catch (e) {
            this.emit(enum_1.IBuildInEvent.UPLOAD_PROGRESS, -1);
            this.log.error(e);
            throw e;
        }
    }
    registerCommands() {
        if (this.configPath !== '') {
            this.cmd.init();
            this.cmd.loadCommands();
        }
    }
    getConfig(name) {
        if (!name) {
            console.log(this._config);
            return this._config;
        }
        else {
            return lodash_1.get(this._config, name);
        }
    }
    saveConfig(config) {
        if (!common_1.isInputConfigValid(config)) {
            this.log.warn('the format of config is invalid, please provide object');
            return;
        }
        this.setConfig(config);
        this.db.saveConfig(config);
    }
    removeConfig(key, propName) {
        if (!key || !propName)
            return;
        if (common_1.isConfigKeyInBlackList(key)) {
            this.log.warn(`the config.${key} can't be removed`);
            return;
        }
        this.unsetConfig(key, propName);
        this.db.unset(key, propName);
    }
    setConfig(config) {
        if (!common_1.isInputConfigValid(config)) {
            this.log.warn('the format of config is invalid, please provide object');
            return;
        }
        Object.keys(config).forEach((name) => {
            if (common_1.isConfigKeyInBlackList(name)) {
                this.log.warn(`the config.${name} can't be modified`);
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete config[name];
            }
            lodash_1.set(this._config, name, config[name]);
            eventBus_1.eventBus.emit(enum_1.IBusEvent.CONFIG_CHANGE, {
                configName: name,
                value: config[name]
            });
        });
    }
    unsetConfig(key, propName) {
        if (!key || !propName)
            return;
        if (common_1.isConfigKeyInBlackList(key)) {
            this.log.warn(`the config.${key} can't be unset`);
            return;
        }
        lodash_1.unset(this.getConfig(key), propName);
    }
    get request() {
        // TODO: replace request with got: https://github.com/sindresorhus/got
        return this.Request.request;
    }
    async upload(input) {
        if (this.configPath === '') {
            this.log.error('The configuration file only supports JSON format.');
            return [];
        }
        // upload from clipboard
        if (input === undefined || input.length === 0) {
            try {
                const { imgPath, isExistFile } = await getClipboardImage_1.default(this);
                if (imgPath === 'no image') {
                    throw new Error('image not found in clipboard');
                }
                else {
                    this.once('failed', () => {
                        if (!isExistFile) {
                            // 删除 picgo 生成的图片文件，例如 `~/.picgo/20200621205720.png`
                            fs_extra_1.default.remove(imgPath).catch((e) => { this.log.error(e); });
                        }
                    });
                    this.once('finished', () => {
                        if (!isExistFile) {
                            fs_extra_1.default.remove(imgPath).catch((e) => { this.log.error(e); });
                        }
                    });
                    const { output } = await this.lifecycle.start([imgPath]);
                    return output;
                }
            }
            catch (e) {
                this.emit(enum_1.IBuildInEvent.FAILED, e);
                throw e;
            }
        }
        else {
            // upload from path
            const { output } = await this.lifecycle.start(input);
            return output;
        }
    }
}
exports.default = PicGo;
