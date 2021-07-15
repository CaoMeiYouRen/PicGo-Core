import { IPicGo, IPluginConfig } from '../../types';
export interface ISignature {
    signature: string;
    appId: string;
    bucket: string;
    signTime: string;
}
declare const _default: {
    name: string;
    handle: (ctx: IPicGo) => Promise<boolean | IPicGo>;
    config: (ctx: IPicGo) => IPluginConfig[];
};
export default _default;
