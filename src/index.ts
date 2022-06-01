import * as Utils from './utils'

type msgCallback = (evt?: any) => void

interface ISocketEvt {
  before(): boolean // 创建连接之前
  open(wsCode: number): void
  message(wsCode: number, data: any): void
  close(wsCode: number, data?: any): void
  error(wsCode: number, data?: any): void
}

interface ISocketIo {
  url: string
  protocol: 'ws' | 'wss'
  callback?: (data: any) => void
  heartbeatData?: any
  isHeartbeatInspect?: boolean
  heartbeatDelay?: number
  autoReconnect?: boolean
  isAjaxPolling?: boolean
  socketEvt?: ISocketEvt
  maxReconnectTimes?: number
  reconnectDelay?: number
}

class SocketIo {
  private ws: WebSocket|null = null // socket对象
  private url: string // socket连接的url
  private protocol: 'ws' | 'wss' // socket连接协议
  private isAjaxPolling = false // 当浏览器不支持socket服务时，是否使用轮询的方式
  private reqURL: string|null = null // 轮询请求用的URL
  private reqMethod: 'get' | 'post' = 'get' // 轮询使用的请求方式
  private socketEvt: ISocketEvt | null
  private callback: msgCallback = function () { // socket连接成功后，message事件监听的回调函数
    console.warn('[websocket]: 当前未配置数据接收后的回调函数(callback)')
  }

  constructor ({
    url, protocol, callback,
    heartbeatData, isHeartbeatInspect,
    heartbeatDelay, autoReconnect, isAjaxPolling,
    maxReconnectTimes,
    reconnectDelay,
    socketEvt
  }: ISocketIo) {
    this.url = url
    this.protocol = protocol
    this.heartbeatData = heartbeatData || this.heartbeatData
    this.heartbeatDelay = heartbeatDelay || this.heartbeatDelay
    this.autoReconnect = autoReconnect ?? false
    this.isAjaxPolling = isAjaxPolling ?? false
    this.isHeartbeatInspect = isHeartbeatInspect ?? false
    this.socketEvt = socketEvt ?? null
    this.maxReconnectTimes = maxReconnectTimes || this.maxReconnectTimes || 3
    this.reconnectDelay =  reconnectDelay || this.reconnectDelay || 3
    this.callback = callback || this.callback

    if (this.createConnectInspect()) {
      this.init()
      this.pollingConnect()
    }
  }

  private init (): void {
    this.ws = new WebSocket(this.getReqURL())
    this.ws.onopen = this.onOpened.bind(this)
    this.ws.onmessage = this.onMessage.bind(this)
    this.ws.onerror = this.onError.bind(this)
    this.ws.onclose = this.onClose.bind(this)
  }

  private pollingConnect (): void {
    if (('Websocket' in window) || !this.isAjaxPolling) {
      return
    }
    // 利用轮询发送数据
  }

  private createConnectInspect (): boolean {
    if (!('WebSocket' in window)) {
      console.error('[websocket]: 当前浏览器不支持创建websocket服务')
      return false
    }
    if (!this.url) {
      console.error('[websocket]: 请配置需要连接websocket服务的url')
      return false
    }
    if (!/^ws(s)/ig.test(this.url) && !this.protocol) {
      console.error('[websocket]: 未知websocket连接的协议(ws|wss)')
      return false
    }
    if (Utils.isFunction(this.socketEvt?.before)) {
      return this.socketEvt?.before.call(this) || false
    }
    return true
  }

  private onOpened (): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[websocket]: websocket服务已经成功创建连接')
      this.restoreReconnectStatus()
      // 如果需要心跳检测则在连接成功后初始化心跳检测
      this.isHeartbeatInspect && this.heartbeat()
      if (Utils.isFunction(this.socketEvt?.open)) {
        this.socketEvt?.open.call(this, this.ws.readyState)
      }
    }
  }

  private restoreReconnectStatus () {
    this.reconnectTimes = this.maxReconnectTimes
    this.isReconnecting = false
  }

  private onMessage (evt: any): void {
    if (this.isHeartbeatInspect) this.heartbeat()
    if (Utils.isFunction(this.callback)) {
      this.callback(evt)
    } else if (Utils.isFunction(this.socketEvt?.message)) {
      this.socketEvt?.message.call(this, this.ws?.readyState || -1, evt)
    }
  }

  private onError (): void {
    if (this.autoReconnect) this.reconnectWS()
    if (Utils.isFunction(this.socketEvt?.error)) {
      this.socketEvt?.error.call(this, this.ws?.readyState || -1)
    }
  }

  private onClose (): void {
    if (this.autoReconnect) this.reconnectWS()
    if (Utils.isFunction(this.socketEvt?.close)) {
      this.socketEvt?.close.call(this, this.ws?.readyState || -1)
    }
  }

  private getReqURL (): string {
    if (/^ws(s)/.test(this.url)) {
      return this.url
    }
    return `${this.protocol}://${this.url}`
  }

  private getPollingURL (): string {
    if (this.reqURL) return this.reqURL
    if (/^ws(s)/ig.test(this.url)) {
      const [protocol, url] = this.url.split('://')
      return `${protocol === 'wss' ? 'https' : 'http'}://${url}`
    }
    return `${this.protocol === 'wss' ? 'https' : 'http'}://${this.url}`
  }

  public emitData (data: any): void {
    this.ws?.send(JSON.stringify(data))
  }

  private heartbeatTimer: null | number = null // 心跳检测定时器
  private isHeartbeatInspect = false // 是否开启心跳检测
  private heartbeatDelay = 5 // 心跳检测延迟时长
  private heartbeatData = { cmd: 'heart', module: 'ping' } // 发送心跳检测的数据
  private heartbeat (): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer)
    this.heartbeatTimer = setInterval(() => {
      this.emitData(this.heartbeatData)
    }, this.heartbeatDelay * 1000)
  }

  private autoReconnect = false // 断开后是否自动重连
  private isReconnecting = false // 是否正在重连中
  private maxReconnectTimes = 3 // 最大重连次数
  private reconnectTimes = this.maxReconnectTimes
  private reconnectDelay = 3 // 每次重连之间间隔时长
  private reconnectWS (): void {
    if (this.reconnectTimes === 0 || this.isReconnecting || this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) return
    try {
      this.isReconnecting = true
      const self = this
      const timer = setTimeout(() => {
        clearTimeout(timer)
        this.isReconnecting = false
        this.init.call(self)
      }, this.reconnectDelay * 1000)
    } catch (err) {} finally {
      this.reconnectTimes -= 1
    }
  }

  destroyed (): void {
    this.ws?.close()
  }
}

export default SocketIo
