### Websocket连接配置

#### 使用方式
```javascript
import SocketIO from 'client-ws'

const socket = new SocketIO([options])

// 发送信息
socket.emitData(...)

// 或者

class MySocket extends SocketIO {
    constructor() {
        super([options])
    }

    // 发送websocket信息
    emit () {
        this.emitData(...)
    }
}

```

##### 配置项[Options]

|字段|是否必传|默认值|说明|
|-|-|-|-|
|url|[Y]|||
|protocol|[Y]|ws|可配置ws、wss|
|callback|[N]|  |websocket接受信息的回调函数，入参evt|
|heartbeatData|[N]|{ cmd: 'heart', module: 'ping' }|心跳数据|
|isHeartbeatInspect|[N]|false|是否心跳检测|
|heartbeatDelay|[N]|5|心跳检测间隔，默认5s|
|autoReconnect|[N]|false|是否断开后自动重连|
|socketEvt|[N]|  |websocket事件, 改值为一个对象，详细参考下述说明|

##### websocket事件[socketEvt]
|字段|是否必传|类型|说明|是否需要返回值|入参|
|-|-|-|-|-|-|
|before|[N]|Function|实例化websocket对象之前，返回一个布尔, true则创建，false取消| Boolean |无|
|open|[N]|Function|websocket连接成功后触发open事件调用|void|websocketCode|
|message|[N]|Function|websocket接收到数据调用|void|websocketCode, data|
|close|[N]|Function|websocket关闭时调用|void|websocketCode, [data]|
|error|[N]|Function|websocket触发错误时调用|void|websocketCode, [data]|


##### 其他数据类型判断方法

```javascript
import * as Utils from "client-ws/dist/utils"

Utils.isNull(data)
Utils.isUndefined(data)
Utils.isFunction(data)
Utils.isObject(data)
Utils.isText(data)
Utils.isArray(data)
Utils.isTypeOf(data, type)
```