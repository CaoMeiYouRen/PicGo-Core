"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const initUtils_1 = require("../../utils/initUtils");
const os_1 = require("os");
// @ts-expect-error
const download_git_repo_1 = __importDefault(require("download-git-repo"));
const rimraf_1 = __importDefault(require("rimraf"));
const run = (ctx, options) => {
    // const name = options.inPlace ? path.relative('../', process.cwd()) : options.project
    if (options.offline) { // offline mode
        if (fs_extra_1.default.existsSync(options.template)) {
            initUtils_1.generate(ctx, options).catch((e) => { ctx.log.error(e); });
        }
        else {
            ctx.log.error(`Local template ${options.template} not found`);
        }
    }
    else { // online mode
        options.template = !options.hasSlash
            ? 'PicGo/picgo-template-' + options.template // official template
            : options.template;
        downloadAndGenerate(ctx, options);
    }
};
/**
 * download template & generate
 * @param { PicGo } ctx
 * @param { IOptions } options
 */
const downloadAndGenerate = (ctx, options) => {
    if (fs_extra_1.default.existsSync(options.tmp)) {
        rimraf_1.default.sync(options.tmp);
    }
    ctx.log.info('Template files are downloading...');
    download_git_repo_1.default(options.template, options.tmp, { clone: options.clone }, (err) => {
        if (err) {
            return ctx.log.error(err);
        }
        ctx.log.success('Template files are downloaded!');
        initUtils_1.generate(ctx, options).catch((e) => { ctx.log.error(e); });
    });
};
const init = {
    handle: async (ctx) => {
        const cmd = ctx.cmd;
        cmd.program
            .command('init')
            .arguments('<template> [project]')
            .option('--clone', 'use git clone')
            .option('--offline', 'use cached template')
            .description('create picgo plugin\'s development templates')
            .action((template, project, program) => {
            (async () => {
                // Thanks to vue-cli init: https://github.com/vuejs/vue-cli/blob/master/bin/vue-init
                try {
                    const hasSlash = template.includes('/');
                    const inPlace = !project || project === '.';
                    const dest = path_1.default.resolve(project || '.');
                    const clone = program.clone || false;
                    const offline = program.offline || false;
                    const tmp = path_1.default.join(os_1.homedir(), '.picgo/templates', template.replace(/[/:]/g, '-')); // for caching template
                    if (program.offline) {
                        template = tmp;
                    }
                    const options = {
                        template,
                        project,
                        hasSlash,
                        inPlace,
                        dest,
                        clone,
                        tmp,
                        offline
                    };
                    // check if project is empty or exist
                    if (inPlace || fs_extra_1.default.existsSync(dest)) {
                        await ctx.cmd.inquirer.prompt([
                            {
                                type: 'confirm',
                                message: inPlace
                                    ? 'Generate project in current directory?'
                                    : 'Target directory exists. Continue?',
                                name: 'ok'
                            }
                        ]).then((answer) => {
                            if (answer.ok) {
                                run(ctx, options);
                            }
                        });
                    }
                    else { // project is given
                        run(ctx, options);
                    }
                }
                catch (e) {
                    ctx.log.error(e);
                    if (process.argv.includes('--debug')) {
                        throw e;
                    }
                }
            })().catch((e) => { ctx.log.error(e); });
        })
            .on('--help', () => {
            console.log();
            console.log('Examples:');
            console.log();
            console.log(chalk_1.default.gray('  # create a new project with an official template'));
            console.log('  $ picgo init plugin my-project');
            console.log();
            console.log(chalk_1.default.gray('  # create a new project straight from a github template'));
            console.log('  $ picgo init username/repo my-project');
            console.log();
        });
    }
};
exports.default = init;
