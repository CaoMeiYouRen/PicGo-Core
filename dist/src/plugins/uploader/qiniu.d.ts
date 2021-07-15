import { IPluginConfig, IPicGo } from '../../types';
declare const _default: {
    name: string;
    handle: (ctx: IPicGo) => Promise<IPicGo>;
    config: (ctx: IPicGo) => IPluginConfig[];
};
export default _default;
