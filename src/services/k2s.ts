import { Context, Service } from "koishi";
import { Loader } from '@koishijs/loader'

import { PublicFeat } from "../feat"
import { K2345d } from "../impl/k2-defense";
import { K2Service } from "../constants";
import { HookPass, K2345s } from "../impl/k2-security";
import { K2Defense } from './k2d'
import "../impl/k2-early-keep"

declare module '@koishijs/loader' {
  interface Loader {
    name?: string
  }
}
Loader.prototype.name = 'loader'

export const name = 'k2s'

declare module 'koishi' {
  interface Context {
    k2s: K2345Security
  }
}

export class K2345Security extends Service {
  static feat: PublicFeat = new PublicFeat(K2345s.config)
  static using = ['k2d']
  protected cls = K2345Security
  private readonly ContextPlugin: typeof Context.prototype.plugin
  static PassFlag = HookPass
  PassFlag = HookPass

  constructor(protected ctx: Context, config: K2345Security.Config) {
    super(ctx, name, true)
    ctx.root[K2Service] = true
    ctx.root.mapping[name] = K2Service
    ctx.root[K2Service] = this
    this[Context.expose] = name

    K2345s.config.context = ctx
    K2345s.config.feats.ctx = ctx

    K2345d.ctxCheckPerform(this.caller)

    if (!ctx.registry.has(K2Defense))
      ctx.plugin(K2Defense, config)
  }

  async start() {
    this.ctx.root[K2Service] = this

    this.ctx.runtime.reset = () => undefined

    this.ctx.runtime.dispose = () => false

    K2345d.ctxCheck(this.caller)

    K2345d.run(this.ctx)

    // this.ctx.using(['console'], (ctx) => {
    //   ctx.console.addEntry({
    //     /* ... */
    //   })
    // })
  }

  protected protectCaller() {
    const caller1 = this.caller

    K2345d.ctxCheckPerform(caller1, true)

    if (caller1) {
      (() => {
        const caller = caller1
        caller.runtime.reset = () => undefined
        caller.runtime.dispose = () => false

        caller.on('dispose', () => {
          caller.runtime.restart()
          K2345s.denied('unloadProtect', "unload", "已为您阻止意外操作")
        })

        const deleter = caller.registry.delete
        caller.registry.delete = function _wrapper(plugin) {
          if (plugin === caller.runtime.plugin) {
            caller.logger('app').error('unable to unload %c due to access denied', caller.runtime.name)
            K2345s.denied('unloadProtect', "unload", "已为您阻止意外操作")
            return false // ur not able to delete it !!!!!
          }
          return deleter.call(this, plugin)
        }
      })()
    }
  }

  protectMe = this.protectCaller

  checkFile = K2345s.checkFile
  hWrapper = K2345s.hookWrapper
  hWrapperAsync = K2345s.hookWrapperAsync
  dRemoteKill: typeof K2345d.dRemoteKill = K2345d.dRemoteKill.bind(K2345d)
  kIHookMethod = K2345s.k2EZIHook
  kIHookMethodAsync = K2345s.k2EZIHookAsync
  hook = K2345s.hook
  hookAsync = K2345s.hookAsync
}

namespace K2345Security {
  export interface Config {
    allowOperate: boolean,
    allowSelfDefense: boolean,
    allowAutoUpdate: boolean,
    allowEarlySelfDefense: true,
    loaderIsolation: true
  }
}


Context.service(name, K2345Security)
