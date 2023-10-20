import { Context, Service } from "koishi";
import { Loader } from '@koishijs/loader'

import { PublicFeat } from "../feat"
import { K2345d } from "../impl/k2-defense";
import { K2Service } from "../constants";
import { HookPass, K2345s } from "../impl/k2-security";
import { K2Defense } from './k2d'
import "../impl/k2-early-keep"
import { Config } from '../shared'

declare module '@koishijs/loader' {
  interface Loader {
    name?: string
  }
}
Loader.prototype.name = 'loader'

export const name = 'k2s'

declare module 'koishi' {
  export interface Context {
    k2s: K2Security
  }
}

export class K2Security<T extends Config = Config> extends Service {
  static feat: PublicFeat = new PublicFeat(K2345s.config)
  static immediate = true
  protected cls = K2Security<T>
  static PassFlag = HookPass
  PassFlag = HookPass

  constructor(protected ctx: Context, config: T) {
    super(ctx, name, true)
    ctx.root[K2Service] = true
    ctx.root.mapping[name] = K2Service
    ctx.root[K2Service] = this
    this[Context.expose] = name

    K2345s.config.context = ctx

    K2345d.ctxCheckPerform(this.caller)

    if (!(ctx.k2d || ctx.registry.has(K2Defense)))
      ctx.registry.plugin(K2Defense, config)
  }

  async start() {
    this.ctx.root[K2Service] = this

    this.ctx.runtime.reset = () => undefined

    this.ctx.runtime.dispose = () => false

    K2345d.ctxCheck(this.caller)

    K2345d.runOnce(this.ctx)
  }

  ensureEnvironment() {
    K2345d.ctxCheckPerform(this.caller, true)
    K2345d.runOnce(this.ctx)
  }

  protected protectCaller() {
    const caller1 = this.caller

    K2345d.ctxCheckPerform(caller1, true)
  }

  protectMe = this.protectCaller

  filenameCheck = K2345s.filenameCheck
}


Context.service(name, K2Security)
