import { ILogArgvType, ILogArgvTypeWithError, ILogger, IPicGo } from '../types';
declare class Logger implements ILogger {
    private readonly level;
    private readonly ctx;
    private logLevel;
    private logPath;
    constructor(ctx: IPicGo);
    private handleLog;
    private handleWriteLog;
    private checkLogLevel;
    success(...msg: ILogArgvType[]): void;
    info(...msg: ILogArgvType[]): void;
    error(...msg: ILogArgvTypeWithError[]): void;
    warn(...msg: ILogArgvType[]): void;
}
export default Logger;
