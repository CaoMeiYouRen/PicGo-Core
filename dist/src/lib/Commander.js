"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = __importDefault(require("commander"));
const inquirer_1 = __importDefault(require("inquirer"));
const commander_2 = __importDefault(require("../plugins/commander"));
const package_json_1 = require("../../package.json");
class Commander {
    constructor(ctx) {
        this.list = {};
        this.program = commander_1.default;
        this.inquirer = inquirer_1.default;
        this.ctx = ctx;
    }
    init() {
        this.program
            .version(package_json_1.version, '-v, --version')
            .option('-d, --debug', 'debug mode', () => {
            this.ctx.setConfig({
                debug: true
            });
        })
            .option('-s, --silent', 'silent mode', () => {
            this.ctx.setConfig({
                silent: true
            });
        })
            .on('command:*', () => {
            this.ctx.log.error(`Invalid command: ${this.program.args.join(' ')}\nSee --help for a list of available commands.`);
            process.exit(1);
        });
        // built-in commands
        commander_2.default(this.ctx);
    }
    register(name, plugin) {
        if (!name)
            throw new TypeError('name is required!');
        if (typeof plugin.handle !== 'function')
            throw new TypeError('plugin.handle must be a function!');
        if (name in this.list)
            throw new TypeError('duplicate name!');
        this.list[name] = plugin;
    }
    loadCommands() {
        Object.keys(this.list).map((item) => this.list[item].handle(this.ctx));
    }
    get(name) {
        return this.list[name];
    }
    getList() {
        return Object.keys(this.list).map((item) => this.list[item]);
    }
}
exports.default = Commander;
