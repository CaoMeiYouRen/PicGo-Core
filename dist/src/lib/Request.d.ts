import { RequestPromiseOptions, RequestPromiseAPI } from 'request-promise-native';
import { IPicGo } from '../types';
declare class Request {
    private readonly ctx;
    private proxy;
    options: RequestPromiseOptions;
    constructor(ctx: IPicGo);
    private init;
    get request(): RequestPromiseAPI;
}
export default Request;
