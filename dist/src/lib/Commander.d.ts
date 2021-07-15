import { CommanderStatic } from 'commander';
import { Inquirer } from 'inquirer';
import { IPlugin, ICommander, IPicGo } from '../types';
declare class Commander implements ICommander {
    private list;
    program: CommanderStatic;
    inquirer: Inquirer;
    private readonly ctx;
    constructor(ctx: IPicGo);
    init(): void;
    register(name: string, plugin: IPlugin): void;
    loadCommands(): void;
    get(name: string): IPlugin;
    getList(): IPlugin[];
}
export default Commander;
