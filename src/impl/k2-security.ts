import { Context, Dict, Logger, Promisify, Random } from "koishi";
import { bfConfig, K2Origin } from "../constants";
import { K2345d } from "./k2-defense";
import { K2ReloadOptions, UpdateOptions } from './k2-var'
import { awaitIfNonNull, ReturnType, sourceOf, ThisType, UnPromisify } from "../utils";
import { Awaitable } from "cosmokit";
import { Installer } from "@koishijs/plugin-market";
import { K2Security } from "../services/k2s";
import { K2Defense } from "../services/k2d";
import process from 'process'

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

  static get counter() {
    return K2345d.counter
  }

  static set counter(val: number) {
    K2345d.counter = val
  }

  static filenameCheck(s: string) {
    let isUnsafe = s.indexOf('node_modules') >= 0 || s.indexOf('package.json') >= 0
    let isConfig = s.indexOf('koishi.yml') >= 0 || s.indexOf('tsconfig') >= 0
      || s.endsWith(".properties")
      || s.endsWith(".yml") || s.endsWith(".yaml") || s.endsWith(".json")
    let isCode = s.indexOf('/src') >= 0 || s.indexOf('/client') >= 0
      || s.indexOf('/lib') >= 0 || s.indexOf('/dist') >= 0
    let isImportant = s.indexOf('k2345') >= 0 || s.indexOf('koishi-2345') >= 0
    return isUnsafe || isCode || isConfig || isImportant
  }


  static lolDenied(registryName: string, hookedName: string = registryName, message: string = "已为您阻止访问关键性内容"): any {
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
      "这是一段神奇的 16进制 - 3570697635357145364c2b5a357069763536576535615748354c714d364c2b6235596932",
      "发生了神奇的事情",
      "似乎发生了什么问题, 但是 Koishi 已经帮助 Nonebot2 实现 nb2-on! 了",
      "发生了一点问题, 但是 https://github.com/koishijs/koishi",
      "你说的对, 但是《原神》是由 miHomo 自主研发的一看开放逝界冒险游戏",
      "What? You're right, but Genshin Impact is totally self-development game from HoYoverse",
      "Error: /setu - 418 I'm a teapot",
      "Error: /setu - 418 I'm a teapot",
      "Error: /setu - 418 I'm a teapot",
      "Error: /setu - 403 Forbidden",
      "Error: /setu - 401 Unauthorized!",
      "Error: /setu - 402 Payment required(?)",
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
    const originFunc: K[V] = sourceOf(func)

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
    const originFunc: K[V] = sourceOf(func)

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


  static async selfUpdate(ctx: Context, deps: Dict<string>) {
    ctx.using(['installer'], async (ctx) => {
      let ret = await ctx.installer.install(deps)
      if (ret != 0)
        ctx.runtime.cancel(`installion failed with exit code: ${ret}`)
    })
  }

  static async installerGetDeps(ctx: Context): ReturnType<InstanceType<typeof Installer>['getDeps']> {
    if (ctx.installer)
      return await ctx.installer.getDeps() ??
        await awaitIfNonNull(ctx.installer['_getDeps']) ??
        ctx.installer['manifest'].dependencies
    else
      return await ctx.console.dependencies.get()
  }

  static async selfReload(options: K2ReloadOptions, oldDeps: UnPromisify<ReturnType<InstanceType<typeof Installer>['getDeps']>>) {
    const ctx = options.ctx
    delete options.ctx


    for (const key in options) {
      const val = options[key]
      if (val instanceof Context) {
        const disposeCtx: Context = val

        if (ctx.registry.has(disposeCtx.runtime.plugin))
          ctx.registry.dispose(disposeCtx.runtime.plugin)

        disposeCtx.scope.dispose()

        const parent = disposeCtx.scope.parent
        const isParentGreat = parent.runtime.status == 'active' || parent.runtime.status == 'loading'

        disposeCtx.runtime
      } else {
        if (val instanceof K2Security || val instanceof K2Defense) {
          const runtime = ctx.registry.get(<any>val)
          this.logger.info(runtime)
        }
      }
    }

    ctx.scope.dispose()
  }

  static async checkVersion(ctx: Context, options: UpdateOptions, refresh: boolean = false, reload: boolean = false) {
    ctx.using(['installer'], () => {
        ctx.root.runtime.ensure(async () => {
          if (refresh) ctx.installer.refresh(true)

          const names = ctx.installer.resolveName('koishi-plugin-k2s')

          const versions = await ctx.installer.findVersion(names)

          const oldDeps = await this.installerGetDeps(ctx)

          const k2s = oldDeps['koishi-plugin-k2s']

          if (oldDeps) {
            if (k2s) {
              if (k2s.resolved != k2s.latest) {
              } else if (options.useLatest && oldDeps['koishi-plugin-k2s'].request !== 'latest')
                await ctx.installer.override({ "koishi-plugin-k2s": "latest" })
              if (!options.autoUpdate)
                return

              await this.selfUpdate(ctx, versions)
              await this.selfReload({
                ctx,
                k2s: ctx.k2s,
                k2d: ctx.k2d
              }, oldDeps)
            } else {
              if (process.env.NODE_ENV !== 'development') {
                await ctx.installer.override({ "koishi-plugin-k2s": versions['koishi-plugin-k2s'] })
              }
            }
          }
        })
      }
    )
  }
}
