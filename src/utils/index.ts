export function isNull (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object Null]'
  }
  export function isUndefined (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object Undefined]'
  }
  export function isFunction (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object Function]'
  }
  export function isObject (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object Object]'
  }
  export function isText (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object String]'
  }
  export function isArray (data: any): boolean {
    return Object.prototype.toString.call(data) === '[object Array]'
  }
  export function isTypeOf (data: any, type: string): boolean {
    return Object.prototype.toString.call(data) === type
  }
  