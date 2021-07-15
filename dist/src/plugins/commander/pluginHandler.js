"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pluginHandler = {
    handle: (ctx) => {
        // const pluginHandler = new PluginHandler(ctx)
        const cmd = ctx.cmd;
        cmd.program
            .command('install <plugins...>')
            .description('install picgo plugin')
            .alias('add')
            .option('-p, --proxy <proxy>', 'Add proxy for installing')
            .option('-r, --registry <registry>', 'Choose a registry for installing')
            .action((plugins, program) => {
            const { proxy, registry } = program;
            const options = {
                proxy,
                registry
            };
            ctx.pluginHandler.install(plugins, options).catch((e) => { ctx.log.error(e); });
        });
        cmd.program
            .command('uninstall <plugins...>')
            .alias('rm')
            .description('uninstall picgo plugin')
            .action((plugins) => {
            ctx.pluginHandler.uninstall(plugins).catch((e) => { ctx.log.error(e); });
        });
        cmd.program
            .command('update <plugins...>')
            .description('update picgo plugin')
            .option('-p, --proxy <proxy>', 'Add proxy for installing')
            .option('-r, --registry <registry>', 'Choose a registry for installing')
            .action((plugins, program) => {
            const { proxy, registry } = program;
            const options = {
                proxy,
                registry
            };
            ctx.pluginHandler.update(plugins, options).catch((e) => { ctx.log.error(e); });
        });
    }
};
exports.default = pluginHandler;
