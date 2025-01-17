"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContext = void 0;
/**
 * create an unique context for each upload process
 * @param ctx
 */
exports.createContext = (ctx) => {
    return {
        configPath: ctx.configPath,
        baseDir: ctx.baseDir,
        log: ctx.log,
        cmd: ctx.cmd,
        output: [],
        input: [],
        pluginLoader: ctx.pluginLoader,
        pluginHandler: ctx.pluginHandler,
        Request: ctx.Request,
        helper: ctx.helper,
        VERSION: ctx.VERSION,
        GUI_VERSION: ctx.GUI_VERSION,
        request: ctx.request,
        getConfig: ctx.getConfig.bind(ctx),
        saveConfig: ctx.saveConfig.bind(ctx),
        removeConfig: ctx.removeConfig.bind(ctx),
        setConfig: ctx.setConfig.bind(ctx),
        unsetConfig: ctx.unsetConfig.bind(ctx),
        upload: ctx.upload.bind(ctx),
        addListener: ctx.addListener.bind(ctx),
        on: ctx.on.bind(ctx),
        once: ctx.once.bind(ctx),
        removeListener: ctx.removeListener.bind(ctx),
        off: ctx.off.bind(ctx),
        removeAllListeners: ctx.removeAllListeners.bind(ctx),
        setMaxListeners: ctx.setMaxListeners.bind(ctx),
        getMaxListeners: ctx.getMaxListeners.bind(ctx),
        listeners: ctx.listeners.bind(ctx),
        rawListeners: ctx.rawListeners.bind(ctx),
        emit: ctx.emit.bind(ctx),
        listenerCount: ctx.listenerCount.bind(ctx),
        prependListener: ctx.prependListener.bind(ctx),
        prependOnceListener: ctx.prependOnceListener.bind(ctx),
        eventNames: ctx.eventNames.bind(ctx)
    };
};
