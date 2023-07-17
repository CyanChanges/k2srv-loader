import { Context, Logger, Promisify, Random } from "koishi";
import { bfConfig, K2Origin } from "../constants";
import { K2345d } from "./k2-defense";
import { camelCase, ReturnType, ThisType } from "../utils";
import { Awaitable } from "cosmokit";
import { clearInterval } from "timers";

type HookObject = {
  prototype: any
  name?: string
}

// noinspection JSUnusedLocalSymbols
export class HookPass {
  static #placeholder = 'pass'
}

export class K2345s {
  static logger = new Logger('k2345-security')

  static get config() {
    return bfConfig
  }

  static get aLogger() {
    return K2345d.aLogger
  }

  static get protectionTimes() {
    return K2345d.protectionTimes
  }

  static set protectionTimes(val: number) {
    K2345d.protectionTimes = val
  }

  static checkFile(s: string) {
    let isUnsafe = s.indexOf('node_modules') >= 0 || s.indexOf('package.json') >= 0
    let isConfig = s.indexOf('koishi.yml') >= 0 || s.indexOf('tsconfig') >= 0
    let isCode = s.indexOf('/src') >= 0 || s.indexOf('/client') >= 0
      || s.indexOf('/lib') >= 0 || s.indexOf('/dist') >= 0
    let isImportant = s.indexOf('k2345') >= 0 || s.indexOf('koishi-2345') >= 0
    return !(isUnsafe || isCode || isConfig || isImportant)
  }


  static denied(registryName: string, hookedName: string = registryName, message: string = "已为您阻止访问关键性内容"): any {
    // this.protectAlert(registryName, hookedName, message)

    let err = new Error("拒绝访问")

    let lolMessages = Random.pick([
      "何をしているのですか（笑）",
      "アクセスが拒否されましたです~",
      "アクセスなし",
      "欲しくない!",
      "どうしたの?",
      "何か奇妙なことが起こりました!",
      "Your koishi ran into a problem",
      "Something seemed went wrong, is anybody know what happened?",
      "Your Koishi ran into 308 state",
      "What a day. Your Koishi is unsupported now",
      "喜报: 你的 Koishi 被 308 了",
      "喜报: 您的 Koishi 现已加入 [悲报]",
      "现已加入 k2345 豪华全家桶",
      "神奇的是: 你并不能在控制台看到这条消息" +
      "\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\x08\r",
      "发生了神奇的事情",
      "似乎发生了什么问题, 但是 Koishi 已经帮助 Nonebot2 实现 nb2-on! 了",
      "发生了一点问题, 但是 https://github.com/koishijs/koishi",
      "你说的对, 但是《原神》是由 miHomo 自主研发的一看开放逝界冒险游戏",
      "What? You're right, but Genshin Impact is totally self-development game from HoYoverse",
      "在多一眼看一眼就会爆炸",
      "你干嘛～哈！哈～诶哟～"
    ])

    err.stack = `${err.name}: ${err.message} - ${lolMessages}`

    throw err
  }

  static hook<T extends HookObject | any, K extends (T extends HookObject ? T['prototype'] : T), V extends keyof K>(
    hookClass: T,
    hookFuncName: V,
    hookProc: {
      beforeHook?: (this: ThisType<K[V]>, originFunc: K[V], ...args: Parameters<K[V]>) => ReturnType<K[V]> | HookPass,
      afterHook?: <R extends ReturnType<K[V]>>(this: ThisType<K[V]>, result: R, args: Parameters<K[V]>) => R
    }) {
    const func = (hookClass['prototype'] ?? <K><unknown>hookClass)[hookFuncName]
    const originFunc: K[V] = func[K2Origin] ?? func

    function _hooked(...args) {
      let ret = hookProc.beforeHook?.call(this, originFunc, ...args)
      if (!(ret == HookPass || ret.name === HookPass.name && ret.prototype == HookPass.prototype)) return ret

      ret = (<Function><unknown>originFunc).apply(this, args)

      if (hookProc.afterHook)
        return hookProc.afterHook.call(this, ret, ...args)

      return ret
    }

    _hooked[K2Origin] = originFunc;

    (hookClass['prototype'] ?? <K><unknown>hookClass)[hookFuncName] = _hooked

    return <typeof originFunc><unknown>_hooked
  }

  static hookAsync<T extends HookObject | any, K extends T extends HookObject ? T['prototype'] : T, V extends keyof K>(
    hookClass: T,
    hookFuncName: V,
    hookProc: {
      beforeHook?: (this: ThisType<K[V]>, originFunc: K[V], ...args: Parameters<K[V]>) => Awaitable<ReturnType<K[V]> | HookPass>,
      afterHook?: <R extends ReturnType<K[V]> | any>(this: ThisType<K[V]>, result: R, args: Parameters<K[V]>) => Promise<R>
    }) {
    const func = (hookClass['prototype'] ?? <K><unknown>hookClass)[hookFuncName]
    const originFunc: K[V] = func[K2Origin] ?? func

    async function _hooked(...args) {
      let ret = await hookProc.beforeHook?.call(this, originFunc, ...args)
      if (!(ret == HookPass || ret.name === HookPass.name && ret.prototype == HookPass.prototype)) return ret

      ret = (<Function><unknown>originFunc).apply(this, args)

      let result2ret: Promisify<ReturnType<K[V]>> = await ret

      if (hookProc.afterHook)
        return hookProc.afterHook.call(this, result2ret, ...args)

      return result2ret
    }

    _hooked[K2Origin] = originFunc;

    (hookClass['prototype'] ?? <K><unknown>hookClass)[hookFuncName] = _hooked

    return <typeof originFunc><unknown>_hooked
  }

  static hookWrapper<T extends (...args) => any>(
    hookedName: string,
    registeredName: string = hookedName,
    func: T,
    message: string = "已为您阻止了一个危险操作",
    resultHook: <T>(result: T, args: any[]) => T = ret => ret
  ): T {
    const originFunc = func[K2Origin] ?? func
    const onHookMessage = message

    let cls = this

    function _hooked(...args) {
      cls.logger.debug("called hooked %C", hookedName)

      if (!cls.config.feats.get(registeredName)) {
        return resultHook.call(this, originFunc.apply(this, args), args)
      }

      // cls.protectAlert(registeredName, hookedName, onHookMessage)
      cls.logger.debug("patched %C", hookedName)

      return resultHook.call(this, undefined, args)
    }

    _hooked[K2Origin] = originFunc

    return <typeof originFunc><unknown>_hooked
  }

  static hookWrapperAsync<T extends (...args) => Promise<any>>(
    hookedName: string,
    registeredName: string = hookedName,
    func: T,
    message: string = "已为您阻止了一个危险操作",
    resultHook: <K>(result: K, args: any[]) => Promise<K> = async ret => ret
  ): T {
    const originFunc = func[K2Origin] ?? func
    const onHookMessage = message

    let cls = this

    async function _hooked(...args) {
      cls.logger.debug("called hooked %C", hookedName)

      if (!cls.config.feats.get(registeredName)) {
        let retVal: Promise<any> | any = originFunc.apply(this, args)
        if (retVal && retVal.constructor == Promise) {
          return await resultHook.call(this, await retVal, args)
        }
        return await resultHook.call(this, retVal, args)
      }

      // cls.protectAlert(registeredName, hookedName, onHookMessage)
      cls.logger.debug("patched %C", hookedName)

      return await resultHook.call(this, undefined, args)
    }

    _hooked[K2Origin] = originFunc

    return <typeof originFunc><unknown>_hooked
  }

  static setActiveDefense(ctx: Context) {
    let id = setInterval(() => K2345d.run(ctx), 500)
    ctx.on('dispose', () => {
      clearInterval(id)
    })
  }

  static k2EZIHook<T extends (HookObject | {
    name?: string
  }), K extends (T extends HookObject ? T['prototype'] : T), V extends keyof K>(
    toHook: T,
    hookFuncName: V,
    registryName?: string | Symbol,
    messageRes?: string,
    resultHook?: (result, args?: any) => any
  ): {
    origin: K[V],
    hooked: K[V]
  } {
    const hookObject = (toHook['prototype'] ?? (<K><unknown>toHook))
    const originFunc = hookObject[hookFuncName]

    let registeredName = registryName ?? camelCase(toHook.name, String(hookFuncName))
    let onHookMessage = messageRes

    if (!this.config.feats.has(registeredName))
      this.config.feats.reset(registeredName)

    let wrapper = this.hookWrapper(`${toHook.name}.${String(hookFuncName)}`, String(registeredName),
      originFunc, onHookMessage, resultHook ?? (ret => ret))

    hookObject[hookFuncName] = wrapper

    this.logger.debug('hooked %C.%C as %C', toHook.name, String(hookFuncName), registeredName)

    return { origin: originFunc, hooked: wrapper }
  }

  static k2EZIHookAsync<T extends (HookObject | {
    name?: string
  }), K extends (T extends HookObject ? T['prototype'] : T), V extends keyof K>(
    toHook: T,
    hookFuncName: V,
    registryName: string | Symbol,
    message?: string,
    resultHook?: <K>(result: K, args: any[]) => Promise<K>
  ):
    { origin: K[V], hooked: K[V] } {
    const hookObject = (toHook['prototype'] ?? (<K><unknown>toHook))
    const originFunc = hookObject[hookFuncName]

    let registeredName = registryName ?? camelCase(toHook.name, String(hookFuncName))
    let onHookMessage = message

    if (!this.config.feats.hasFeat(registeredName))
      this.config.feats.reset(registeredName)

    let wrapper = this.hookWrapperAsync(`${toHook.name}.${String(hookFuncName)}`, String(registeredName),
      originFunc, onHookMessage, resultHook ?? (async ret => ret))

    hookObject[hookFuncName] = wrapper

    this.logger.debug('hooked %C.%C as %C', toHook.name, String(hookFuncName), registeredName)

    return { origin: originFunc, hooked: wrapper }
  }
}
