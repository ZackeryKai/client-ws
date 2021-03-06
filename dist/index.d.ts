interface ISocketEvt {
    before(): boolean;
    open(wsCode: number): void;
    message(wsCode: number, data: any): void;
    close(wsCode: number, data?: any): void;
    error(wsCode: number, data?: any): void;
}
interface ISocketIo {
    url: string;
    protocol: 'ws' | 'wss';
    callback?: (data: any) => void;
    heartbeatData?: any;
    isHeartbeatInspect?: boolean;
    heartbeatDelay?: number;
    autoReconnect?: boolean;
    isAjaxPolling?: boolean;
    socketEvt?: ISocketEvt;
    maxReconnectTimes?: number;
    reconnectDelay?: number;
}
declare class SocketIo {
    private ws;
    private url;
    private protocol;
    private isAjaxPolling;
    private reqURL;
    private reqMethod;
    private socketEvt;
    private callback;
    constructor({ url, protocol, callback, heartbeatData, isHeartbeatInspect, heartbeatDelay, autoReconnect, isAjaxPolling, maxReconnectTimes, reconnectDelay, socketEvt }: ISocketIo);
    private init;
    private pollingConnect;
    private createConnectInspect;
    private onOpened;
    private restoreReconnectStatus;
    private onMessage;
    private onError;
    private onClose;
    private getReqURL;
    private getPollingURL;
    emitData(data: any): void;
    private heartbeatTimer;
    private isHeartbeatInspect;
    private heartbeatDelay;
    private heartbeatData;
    private heartbeat;
    private autoReconnect;
    private isReconnecting;
    private maxReconnectTimes;
    private reconnectTimes;
    private reconnectDelay;
    private reconnectWS;
    destroyed(): void;
}
export default SocketIo;
