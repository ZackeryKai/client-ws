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
    constructor({ url, protocol, callback, heartbeatData, isHeartbeatInspect, heartbeatDelay, autoReconnect, isAjaxPolling, socketEvt }: ISocketIo);
    private init;
    private pollingConnect;
    private createConnectInspect;
    private onOpened;
    private onMessage;
    private onError;
    private onClose;
    private getReqURL;
    private getPollingURL;
    private emitData;
    private heartbeatTimer;
    private isHeartbeatInspect;
    private heartbeatDelay;
    private heartbeatData;
    private heartbeat;
    private autoReconnect;
    private isReconnecting;
    private maxReconnectTimes;
    private reconnectDelay;
    private reconnectWS;
    destroyed(): void;
}
export default SocketIo;
