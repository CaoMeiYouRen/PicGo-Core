/// <reference types="node" />
import { EventEmitter } from 'events';
import Commander from '../lib/Commander';
import Logger from '../lib/Logger';
import { IHelper, IImgInfo, IPicGo, IStringKeyMap, IPluginLoader } from '../types';
import Request from '../lib/Request';
import PluginHandler from '../lib/PluginHandler';
import { RequestPromiseAPI } from 'request-promise-native';
declare class PicGo extends EventEmitter implements IPicGo {
    private _config;
    private lifecycle;
    private db;
    private _pluginLoader;
    configPath: string;
    baseDir: string;
    helper: IHelper;
    log: Logger;
    cmd: Commander;
    output: IImgInfo[];
    input: any[];
    pluginHandler: PluginHandler;
    /**
     * @deprecated will be removed in v1.5.0+
     *
     * use request instead
     */
    Request: Request;
    VERSION: string;
    GUI_VERSION?: string;
    get pluginLoader(): IPluginLoader;
    constructor(configPath?: string);
    private initConfigPath;
    private initConfig;
    private init;
    registerCommands(): void;
    getConfig<T>(name?: string): T;
    saveConfig(config: IStringKeyMap<any>): void;
    removeConfig(key: string, propName: string): void;
    setConfig(config: IStringKeyMap<any>): void;
    unsetConfig(key: string, propName: string): void;
    get request(): RequestPromiseAPI;
    upload(input?: any[]): Promise<IImgInfo[] | Error>;
}
export default PicGo;
