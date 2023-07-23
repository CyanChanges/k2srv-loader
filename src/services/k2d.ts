import { Context, Service } from "koishi";
import { K2345d } from "../impl/k2-defense";
import { clearInterval } from "timers";
import { rKillOptions } from "../../shared";
import type {} from '@koishijs/plugin-console'
import { Config } from "../shared";

export { PluginMatcher } from '../impl/k2-defense'

export const name = 'k2d'

declare module 'koishi' {
  export interface Context {
    k2d: K2Defense
  }
}

declare module '@koishijs/plugin-console' {
  interface Events {
    "k2d/kill"(options: rKillOptions): boolean
  }
}

export class K2Defense<T extends Config = Config> extends Service {
  dKill: typeof K2345d.dRemoteKill = K2345d.dRemoteKill.bind(K2345d)
  performMatcher: typeof K2345d.performMatcher = K2345d.performMatcher.bind(K2345d)

  constructor(protected ctx: Context, config: T) {
    super(ctx, name, true)
  }

  async start() {
    K2345d.runOnce(this.ctx)

    let id = setInterval(() => K2345d.debouncedRunOnce(this.ctx), 500)
    this.ctx.on('dispose', () => {
      clearInterval(id)
    })

    this.ctx.using(['console'], (ctx) => {
      ctx.console.addListener("k2d/kill", (options: rKillOptions) => {
        return this.dKill(this.ctx, options)
      })
    })
  }
}

Context.service(name, K2Defense)
