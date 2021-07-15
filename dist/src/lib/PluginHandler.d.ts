import { IProcessEnv, IPluginHandler, IPluginHandlerOptions, IPicGo, IPluginHandlerResult } from '../types';
declare class PluginHandler implements IPluginHandler {
    private readonly ctx;
    constructor(ctx: IPicGo);
    install(plugins: string[], options?: IPluginHandlerOptions, env?: IProcessEnv): Promise<IPluginHandlerResult<boolean>>;
    uninstall(plugins: string[]): Promise<IPluginHandlerResult<boolean>>;
    update(plugins: string[], options?: IPluginHandlerOptions, env?: IProcessEnv): Promise<IPluginHandlerResult<boolean>>;
    private execCommand;
}
export default PluginHandler;
