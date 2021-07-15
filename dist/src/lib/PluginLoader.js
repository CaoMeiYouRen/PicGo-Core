"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const resolve_1 = __importDefault(require("resolve"));
const enum_1 = require("../utils/enum");
const LifecyclePlugins_1 = require("./LifecyclePlugins");
/**
 * Local plugin loader, file system is required
 */
class PluginLoader {
    constructor(ctx) {
        this.list = [];
        this.fullList = new Set();
        this.pluginMap = new Map();
        this.ctx = ctx;
        this.init();
    }
    init() {
        const packagePath = path_1.default.join(this.ctx.baseDir, 'package.json');
        if (!fs_extra_1.default.existsSync(packagePath)) {
            const pkg = {
                name: 'picgo-plugins',
                description: 'picgo-plugins',
                repository: 'https://github.com/Molunerfinn/PicGo-Core',
                license: 'MIT'
            };
            fs_extra_1.default.writeFileSync(packagePath, JSON.stringify(pkg), 'utf8');
        }
    }
    // get plugin entry
    resolvePlugin(ctx, name) {
        try {
            return resolve_1.default.sync(name, { basedir: ctx.baseDir });
        }
        catch (err) {
            return path_1.default.join(ctx.baseDir, 'node_modules', name);
        }
    }
    // load all third party plugin
    load() {
        const packagePath = path_1.default.join(this.ctx.baseDir, 'package.json');
        const pluginDir = path_1.default.join(this.ctx.baseDir, 'node_modules/');
        // Thanks to hexo -> https://github.com/hexojs/hexo/blob/master/lib/hexo/load_plugins.js
        if (!fs_extra_1.default.existsSync(pluginDir)) {
            return false;
        }
        const json = fs_extra_1.default.readJSONSync(packagePath);
        const deps = Object.keys(json.dependencies || {});
        const devDeps = Object.keys(json.devDependencies || {});
        const modules = deps.concat(devDeps).filter((name) => {
            if (!/^picgo-plugin-|^@[^/]+\/picgo-plugin-/.test(name))
                return false;
            const path = this.resolvePlugin(this.ctx, name);
            return fs_extra_1.default.existsSync(path);
        });
        for (const module of modules) {
            this.registerPlugin(module);
        }
        return true;
    }
    registerPlugin(name, plugin) {
        if (!name || typeof name !== 'string') {
            this.ctx.log.warn('Please provide valid plugin');
            return;
        }
        this.fullList.add(name);
        try {
            // register local plugin
            if (!plugin) {
                if (this.ctx.getConfig(`picgoPlugins.${name}`) === true || (this.ctx.getConfig(`picgoPlugins.${name}`) === undefined)) {
                    this.list.push(name);
                    LifecyclePlugins_1.setCurrentPluginName(name);
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.getPlugin(name).register(this.ctx);
                    const plugin = `picgoPlugins[${name}]`;
                    this.ctx.saveConfig({
                        [plugin]: true
                    });
                }
            }
            else {
                // register provided plugin
                // && won't write config to files
                this.list.push(name);
                LifecyclePlugins_1.setCurrentPluginName(name);
                const pluginInterface = plugin(this.ctx);
                this.pluginMap.set(name, pluginInterface);
                plugin(this.ctx).register(this.ctx);
            }
        }
        catch (e) {
            this.pluginMap.delete(name);
            this.list = this.list.filter((item) => item !== name);
            this.fullList.delete(name);
            this.ctx.log.error(e);
            this.ctx.emit(enum_1.IBuildInEvent.NOTIFICATION, {
                title: `Plugin ${name} Load Error`,
                body: e
            });
        }
    }
    unregisterPlugin(name) {
        this.list = this.list.filter((item) => item !== name);
        this.fullList.delete(name);
        this.pluginMap.delete(name);
        LifecyclePlugins_1.setCurrentPluginName(name);
        this.ctx.helper.uploader.unregister(name);
        this.ctx.helper.transformer.unregister(name);
        this.ctx.helper.beforeTransformPlugins.unregister(name);
        this.ctx.helper.beforeUploadPlugins.unregister(name);
        this.ctx.helper.afterUploadPlugins.unregister(name);
        this.ctx.removeConfig('picgoPlugins', name);
    }
    // get plugin by name
    getPlugin(name) {
        if (this.pluginMap.has(name)) {
            return this.pluginMap.get(name);
        }
        const pluginDir = path_1.default.join(this.ctx.baseDir, 'node_modules/');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const plugin = require(pluginDir + name)(this.ctx);
        this.pluginMap.set(name, plugin);
        return plugin;
    }
    /**
     * Get the list of enabled plugins
     */
    getList() {
        return this.list;
    }
    hasPlugin(name) {
        return this.fullList.has(name);
    }
    /**
     * Get the full list of plugins, whether it is enabled or not
     */
    getFullList() {
        return [...this.fullList];
    }
}
exports.default = PluginLoader;
