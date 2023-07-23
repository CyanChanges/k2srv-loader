import { camelCase as underScore2CamelCase } from "cosmokit";
import { K2Origin } from "./constants";
import { Promisify } from "koishi";

export type * from 'cosmokit'
export type Parameters<F> = F extends (...args: infer P) => any ? P : never
export type ReturnType<F> = F extends (...args: any) => infer R ? R : never
export type ThisType<F> = F extends (this: infer T, ...args: any) => any ? T : never
export type UnPromisify<F> = F extends Promise<infer P> ? P : F

export function camelCase(...args: string[]) {
  return underScore2CamelCase(args.join('_'))
}

export function isPromise<T>(v: any | Promise<T>): v is Promise<T> {
  return v && v.constructor === Promise
}

export function removePrefix(str: string, prefix2remove: string) {
  if (str.startsWith(prefix2remove)) {
    let s = str.substring(prefix2remove.length, Infinity)
    let lowerCased = s[0].toLowerCase()
    s = s.substring(1, Infinity)
    return lowerCased + s
  }
  return str
}

export function addPrefix(str: string, prefix2add: string) {
  let upperCased = str[0].toUpperCase()
  str = str.substring(1, Infinity)
  return prefix2add + upperCased + str
}

export function rtName(packageName: string) {
  return packageName.replace(/(koishi-|^@koishijs\/)plugin-/, '')
}

export function sourceOf<T extends (...args: any) => any>(func: T, bindThis?: any): T | undefined {
  if (typeof func === "undefined") return func
  const origin = func[K2Origin] ?? func
  return bindThis ? origin.bind(bindThis) : origin
}

export async function awaitIfNonNull<T extends (...args)=>Promise<any>>(func: T, ...args: Parameters<T>): Promisify<ReturnType<T> | null> {
  return func ? null : await func(...args)
}
