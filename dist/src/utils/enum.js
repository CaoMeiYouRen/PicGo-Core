"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IBusEvent = exports.IBuildInEvent = exports.ILogType = void 0;
var ILogType;
(function (ILogType) {
    ILogType["success"] = "success";
    ILogType["info"] = "info";
    ILogType["warn"] = "warn";
    ILogType["error"] = "error";
})(ILogType = exports.ILogType || (exports.ILogType = {}));
/**
 * these events will be catched by users
 */
var IBuildInEvent;
(function (IBuildInEvent) {
    IBuildInEvent["UPLOAD_PROGRESS"] = "uploadProgress";
    IBuildInEvent["FAILED"] = "failed";
    IBuildInEvent["BEFORE_TRANSFORM"] = "beforeTransform";
    IBuildInEvent["BEFORE_UPLOAD"] = "beforeUpload";
    IBuildInEvent["AFTER_UPLOAD"] = "afterUpload";
    IBuildInEvent["FINISHED"] = "finished";
    IBuildInEvent["INSTALL"] = "install";
    IBuildInEvent["UNINSTALL"] = "uninstall";
    IBuildInEvent["UPDATE"] = "update";
    IBuildInEvent["NOTIFICATION"] = "notification";
})(IBuildInEvent = exports.IBuildInEvent || (exports.IBuildInEvent = {}));
/**
 * these events will be catched only by picgo
 */
var IBusEvent;
(function (IBusEvent) {
    IBusEvent["CONFIG_CHANGE"] = "CONFIG_CHANGE";
})(IBusEvent = exports.IBusEvent || (exports.IBusEvent = {}));
