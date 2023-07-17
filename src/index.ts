import { Context, MainScope, Schema } from 'koishi'
import path from 'path'
import { readFileSync } from 'node:fs'
import { K2345Security } from "./services/k2s"
import { K2345s } from "./impl/k2-security"
import { K2Origin, K2Service, name } from "./constants"

export { name } from './constants'

export const usage = readFileSync(path.resolve(
  __dirname,
  "./usage.md"
)).toString()

export interface Config {
  allowOperate: boolean,
  allowSelfDefense: boolean,
  allowAutoUpdate: boolean,
  allowEarlySelfDefense: true,
  loaderIsolation: true
}

export const Config: Schema<Config> = Schema.object({
  allowOperate: Schema.boolean()
    .description("允许其他插件调用 k2s 相关服务")
    .default(false),
  allowSelfDefense: Schema.boolean()
    .description("允许 k2s 自我防护")
    .default(false),
  allowEarlySelfDefense: Schema.const(true)
    .description("允许 k2s 实行非 apply 时期的自我防护")
    .default(true),
  allowAutoUpdate: Schema.const(<boolean>false)
    .description("允许 k2s 自动更新 (尽请期待)"),
  loaderIsolation: Schema.const(true as const)
    .description("移除 k2s-loader 和 k2s 服务的关联性")
    .default(true)
})

export function apply(ctx: Context, config: Config) {
  ctx.logger(name).debug("Config: %j", K2345s.config)

  let k2s = ctx.k2s

  if (config.allowSelfDefense) {
    if (!ctx.root[K2Service]) {
      const k2s = (ctx.root.plugin[K2Origin] ?? ctx.root.plugin).bind(ctx)(K2345Security, config)
      k2s.disposables.length = 0
      k2s.uid = 0
      k2s.runtime.uid = 0
      k2s.runtime.dispose = () => false
    }

    ctx.using(['k2s'], (ctx: Context) => {
      ctx.runtime.parent.k2s.protectMe()
    })

    ctx.on('fork', (ctx) => {
      if (ctx.root[K2Service]) ctx.k2s.protectMe()
      else {
        const k2s = (ctx.root.plugin[K2Origin] ?? ctx.root.plugin).bind(ctx)(K2345Security, config)

        ctx.using(['k2s'], (ctx: Context) => {
          ctx.runtime.parent.k2s.protectMe()
        })

        if (!k2s)
          return

        k2s.disposables.length = 0
        k2s.uid = 0
        k2s.runtime.uid = 0
        k2s.runtime.dispose = () => false
      }

    })

    if (!k2s) return
  }

  if (config.loaderIsolation)
    for (const disposablesKey in ctx.runtime.disposables) {
      let disposable = ctx.runtime.disposables[disposablesKey]
      if (disposable[Context.static]) {
        let forkCtx: MainScope = disposable[Context.static]
        if (forkCtx.name == K2345Security.name) {
          delete ctx.runtime.disposables[disposablesKey]
        }
      }
    }
}
