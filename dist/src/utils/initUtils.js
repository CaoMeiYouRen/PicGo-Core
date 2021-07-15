"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeFileTree = exports.render = exports.generate = exports.filters = void 0;
const minimatch_1 = __importDefault(require("minimatch"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
// @ts-expect-error
const globby_1 = __importDefault(require("globby"));
const ejs_1 = __importDefault(require("ejs"));
/**
 * Generate template files to destination files.
 * @param {PicGo} ctx
 * @param {IOptions} options
 */
const generate = async (ctx, options) => {
    try {
        const opts = getOptions(options.tmp);
        const source = path_1.default.join(options.tmp, 'template');
        let answers = {};
        if (opts.prompts && opts.prompts.length > 0) {
            answers = await ctx.cmd.inquirer.prompt(opts.prompts);
        }
        let _files = await globby_1.default(['**/*'], { cwd: source, dot: true }); // get files' name array
        _files = _files.filter((item) => {
            let glob = '';
            Object.keys(opts.filters).forEach((key) => {
                if (minimatch_1.default(item, key, { dot: true })) {
                    glob = item;
                }
            });
            if (glob) { // find a filter expression
                return filters(ctx, opts.filters[glob], answers);
            }
            else {
                return true;
            }
        });
        if (_files.length === 0) {
            return ctx.log.warn('Template files not found!');
        }
        const files = render(_files, source, answers);
        writeFileTree(options.dest, files);
        if (typeof opts.complete === 'function') {
            opts.complete({ answers, options, files: _files, ctx });
        }
        if (opts.completeMessage) {
            ctx.log.success(opts.completeMessage);
        }
        ctx.log.success('Done!');
    }
    catch (e) {
        return ctx.log.error(e);
    }
};
exports.generate = generate;
/**
 * Return the filters' result
 * @param ctx PicGo
 * @param exp condition expression
 * @param data options data
 */
const filters = (ctx, exp, data) => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands, no-new-func, @typescript-eslint/no-implied-eval
    const fn = new Function('data', 'with (data) { return ' + exp + '}');
    try {
        return fn(data);
    }
    catch (e) {
        ctx.log.error(`Error when evaluating filter condition: ${JSON.stringify(exp)}`);
        return false;
    }
};
exports.filters = filters;
/**
 * Get template options
 * @param {string} templatePath
 */
const getOptions = (templatePath) => {
    const optionsPath = path_1.default.join(templatePath, 'index.js');
    if (fs_extra_1.default.existsSync(optionsPath)) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const options = require(optionsPath);
        return options;
    }
    else {
        return {};
    }
};
/**
 * Render files to a virtual tree object
 * @param {arry} files
 */
const render = (files, source, options) => {
    const fileTree = {};
    files.forEach((filePath) => {
        const file = fs_extra_1.default.readFileSync(path_1.default.join(source, filePath), 'utf8');
        const content = ejs_1.default.render(file, options);
        if (Buffer.isBuffer(content) || /[^\s]/.test(content)) {
            fileTree[filePath] = content;
        }
    });
    return fileTree;
};
exports.render = render;
/**
 * Write rendered files' content to real file
 * @param {string} dir
 * @param {object} files
 */
const writeFileTree = (dir, files) => {
    Object.keys(files).forEach((name) => {
        const filePath = path_1.default.join(dir, name);
        fs_extra_1.default.ensureDirSync(path_1.default.dirname(filePath));
        fs_extra_1.default.writeFileSync(filePath, files[name]);
    });
};
exports.writeFileTree = writeFileTree;
