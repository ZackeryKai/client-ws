"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = __importStar(require("./utils"));
var SocketIo = /** @class */ (function () {
    function SocketIo(_a) {
        var url = _a.url, protocol = _a.protocol, callback = _a.callback, heartbeatData = _a.heartbeatData, isHeartbeatInspect = _a.isHeartbeatInspect, heartbeatDelay = _a.heartbeatDelay, autoReconnect = _a.autoReconnect, isAjaxPolling = _a.isAjaxPolling;
        this.ws = null; // socket对象
        this.isAjaxPolling = false; // 当浏览器不支持socket服务时，是否使用轮询的方式
        this.reqURL = null; // 轮询请求用的URL
        this.reqMethod = 'get'; // 轮询使用的请求方式
        this.callback = function () {
            console.warn('[websocket]: 当前未配置数据接收后的回调函数(callback)');
        };
        this.heartbeatTimer = null; // 心跳检测定时器
        this.isHeartbeatInspect = false; // 是否开启心跳检测
        this.heartbeatDelay = 5; // 心跳检测延迟时长
        this.heartbeatData = { cmd: 'heart', module: 'ping' }; // 发送心跳检测的数据
        this.autoReconnect = false; // 断开后是否自动重连
        this.isReconnecting = false; // 是否正在重连中
        this.maxReconnectTimes = 3; // 最大重连次数
        this.reconnectDelay = 3; // 每次重连之间间隔时长
        this.url = url;
        this.protocol = protocol;
        this.heartbeatData = heartbeatData || this.heartbeatData;
        this.heartbeatDelay = heartbeatDelay || this.heartbeatDelay;
        this.autoReconnect = autoReconnect !== null && autoReconnect !== void 0 ? autoReconnect : false;
        this.isAjaxPolling = isAjaxPolling !== null && isAjaxPolling !== void 0 ? isAjaxPolling : false;
        this.isHeartbeatInspect = isHeartbeatInspect !== null && isHeartbeatInspect !== void 0 ? isHeartbeatInspect : false;
        this.callback = callback || this.callback;
        if (this.createConnectInspect()) {
            this.init();
            this.pollingConnect();
        }
    }
    SocketIo.prototype.init = function () {
        this.ws = new WebSocket(this.getReqURL());
        this.ws.onopen = this.onOpened.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
        this.ws.onerror = this.onError.bind(this);
        this.ws.onclose = this.onClose.bind(this);
    };
    SocketIo.prototype.pollingConnect = function () {
        if (('Websocket' in window) || !this.isAjaxPolling) {
            return;
        }
        console.log(this.getPollingURL());
        // 利用轮询发送数据
    };
    SocketIo.prototype.createConnectInspect = function () {
        if (!('WebSocket' in window)) {
            console.error('[websocket]: 当前浏览器不支持创建websocket服务');
            return false;
        }
        if (!this.url) {
            console.error('[websocket]: 请配置需要连接websocket服务的url');
            return false;
        }
        if (!/^ws(s)/ig.test(this.url) && !this.protocol) {
            console.error('[websocket]: 未知websocket连接的协议(ws|wss)');
            return false;
        }
        return true;
    };
    SocketIo.prototype.onOpened = function () {
        var _a;
        if (((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
            console.log('[websocket]: websocket服务已经成功创建连接');
            // 如果需要心跳检测则在连接成功后初始化心跳检测
            this.isHeartbeatInspect && this.heartbeat();
        }
    };
    SocketIo.prototype.onMessage = function (evt) {
        if (this.isHeartbeatInspect)
            this.heartbeat();
        if (Utils.isFunction(this.callback)) {
            this.callback(evt);
        }
    };
    SocketIo.prototype.onError = function () {
        if (this.autoReconnect)
            this.reconnectWS(this.maxReconnectTimes);
    };
    SocketIo.prototype.onClose = function () {
        if (this.autoReconnect)
            this.reconnectWS(this.maxReconnectTimes);
    };
    SocketIo.prototype.getReqURL = function () {
        if (/^ws(s)/.test(this.url)) {
            return this.url;
        }
        return this.protocol + "://" + this.url;
    };
    SocketIo.prototype.getPollingURL = function () {
        if (this.reqURL)
            return this.reqURL;
        if (/^ws(s)/ig.test(this.url)) {
            var _a = this.url.split('://'), protocol = _a[0], url = _a[1];
            return (protocol === 'wss' ? 'https' : 'http') + "://" + url;
        }
        return (this.protocol === 'wss' ? 'https' : 'http') + "://" + this.url;
    };
    SocketIo.prototype.emitData = function (data) {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(data));
    };
    SocketIo.prototype.heartbeat = function () {
        var _this = this;
        if (this.heartbeatTimer)
            clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
            _this.emitData(_this.heartbeatData);
        }, this.heartbeatDelay * 1000);
    };
    SocketIo.prototype.reconnectWS = function (times) {
        var _a, _b;
        if (times === 0 || this.isReconnecting || ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.CONNECTING || ((_b = this.ws) === null || _b === void 0 ? void 0 : _b.readyState) === WebSocket.OPEN)
            return;
        try {
            setTimeout(this.init, this.reconnectDelay * 1000);
        }
        catch (err) {
            this.reconnectWS(times - 1);
        }
    };
    SocketIo.prototype.destroyed = function () {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.close();
    };
    return SocketIo;
}());
exports.default = SocketIo;
