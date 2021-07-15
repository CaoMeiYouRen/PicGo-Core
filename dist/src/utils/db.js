"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lowdb_1 = __importDefault(require("lowdb"));
// @ts-expect-error
const lodash_id_1 = __importDefault(require("lodash-id"));
const FileSync_1 = __importDefault(require("lowdb/adapters/FileSync"));
const comment_json_1 = __importDefault(require("comment-json"));
class DB {
    constructor(ctx) {
        this.ctx = ctx;
        const adapter = new FileSync_1.default(this.ctx.configPath, {
            serialize(obj) {
                return comment_json_1.default.stringify(obj, null, 2);
            },
            deserialize: comment_json_1.default.parse
        });
        this.db = lowdb_1.default(adapter);
        this.db._.mixin(lodash_id_1.default);
        if (!this.db.has('picBed').value()) {
            try {
                this.db.set('picBed', {
                    uploader: 'smms',
                    current: 'smms'
                }).write();
            }
            catch (e) {
                this.ctx.log.error(e);
                throw e;
            }
        }
        if (!this.db.has('picgoPlugins').value()) {
            try {
                this.db.set('picgoPlugins', {}).write();
            }
            catch (e) {
                this.ctx.log.error(e);
                throw e;
            }
        }
    }
    read() {
        return this.db.read();
    }
    get(key = '') {
        return this.read().get(key).value();
    }
    set(key, value) {
        return this.read().set(key, value).write();
    }
    has(key) {
        return this.read().has(key).value();
    }
    insert(key, value) {
        return this.read().get(key).insert(value).write();
    }
    unset(key, value) {
        return this.read().get(key).unset(value).write();
    }
    saveConfig(config) {
        Object.keys(config).forEach((name) => {
            this.set(name, config[name]);
        });
    }
    removeConfig(config) {
        Object.keys(config).forEach((name) => {
            this.unset(name, config[name]);
        });
    }
}
exports.default = DB;
// const initConfig = (configPath: string): lowdb.LowdbSync<any> => {
// }
// const saveConfig = (configPath: string, config: any): void => {
//   const db = initConfig(configPath)
//   Object.keys(config).forEach((name: string) => {
//     db.read().set(name, config[name]).write()
//   })
// }
// export {
// initConfig,
// saveConfig
// }
