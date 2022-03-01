"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTypeOf = exports.isArray = exports.isText = exports.isObject = exports.isFunction = exports.isUndefined = exports.isNull = void 0;
function isNull(data) {
    return Object.prototype.toString.call(data) === '[object Null]';
}
exports.isNull = isNull;
function isUndefined(data) {
    return Object.prototype.toString.call(data) === '[object Undefined]';
}
exports.isUndefined = isUndefined;
function isFunction(data) {
    return Object.prototype.toString.call(data) === '[object Function]';
}
exports.isFunction = isFunction;
function isObject(data) {
    return Object.prototype.toString.call(data) === '[object Object]';
}
exports.isObject = isObject;
function isText(data) {
    return Object.prototype.toString.call(data) === '[object String]';
}
exports.isText = isText;
function isArray(data) {
    return Object.prototype.toString.call(data) === '[object Array]';
}
exports.isArray = isArray;
function isTypeOf(data, type) {
    return Object.prototype.toString.call(data) === type;
}
exports.isTypeOf = isTypeOf;
