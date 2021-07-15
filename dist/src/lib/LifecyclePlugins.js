"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentPluginName = void 0;
class LifecyclePlugins {
    constructor(name) {
        this.name = name;
        this.list = new Map();
        this.pluginIdMap = new Map();
    }
    register(id, plugin) {
        var _a;
        if (!id)
            throw new TypeError('id is required!');
        if (typeof plugin.handle !== 'function')
            throw new TypeError('plugin.handle must be a function!');
        if (this.list.has(id))
            throw new TypeError(`${this.name} duplicate id: ${id}!`);
        this.list.set(id, plugin);
        if (LifecyclePlugins.currentPlugin) {
            if (this.pluginIdMap.has(LifecyclePlugins.currentPlugin)) {
                (_a = this.pluginIdMap.get(LifecyclePlugins.currentPlugin)) === null || _a === void 0 ? void 0 : _a.push(id);
            }
            else {
                this.pluginIdMap.set(LifecyclePlugins.currentPlugin, [id]);
            }
        }
    }
    unregister(pluginName) {
        if (this.pluginIdMap.has(pluginName)) {
            const pluginList = this.pluginIdMap.get(pluginName);
            pluginList === null || pluginList === void 0 ? void 0 : pluginList.forEach((plugin) => {
                this.list.delete(plugin);
            });
        }
    }
    getName() {
        return this.name;
    }
    get(id) {
        return this.list.get(id);
    }
    getList() {
        return [...this.list.values()];
    }
    getIdList() {
        return [...this.list.keys()];
    }
}
exports.setCurrentPluginName = (name = null) => {
    LifecyclePlugins.currentPlugin = name;
};
exports.default = LifecyclePlugins;
