import { IConfig, IPicGo } from '../types';
declare class DB {
    private readonly ctx;
    private readonly db;
    constructor(ctx: IPicGo);
    read(): any;
    get(key?: string): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    insert(key: string, value: any): void;
    unset(key: string, value: any): boolean;
    saveConfig(config: Partial<IConfig>): void;
    removeConfig(config: IConfig): void;
}
export default DB;
