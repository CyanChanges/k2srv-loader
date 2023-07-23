import { Context, Dict, MainScope, Schema } from 'koishi'
import path from 'path'
import { readFileSync } from 'fs'
import { K2Security } from "./services/k2s"
import { K2Service, name } from "./constants"
import type { Config as K2Config } from './shared'
import { sourceOf } from "./utils";

export { name } from './constants'

export * from './services/k2s'
export * from './services/k2d'

export const usage = readFileSync(path.resolve(
  __dirname,
  "./usage.md"
)).toString()

declare module 'koishi' {
  interface Schema<S = any, T = S> extends Schema.Base<T> {
    disabled(): Schema<S, T>
  }
}

export type { K2Config }

export const Config: Schema<Dict> = Schema.intersect([
  Schema.object({
    allowOperate: Schema.boolean()
      .description("允许其他插件调用 k2s 相关服务")
      .default(false),
    allowSelfDefense: Schema.boolean()
      .description("允许 k2s 自我防护")
      .default(false),
    allowEarlySelfDefense: Schema.boolean()
      .description("允许 k2s 在非 apply 时期移除插件")
      .disabled()
      .default(true),
    loaderIsolation: Schema.boolean()
      .description("移除与 k2s 服务的关系")
      .default(true),
    allowAutoUpdate: Schema.boolean().default(false)
      .description("允许 k2s 准备更新"),
  }),
  Schema.union([
    Schema.object({
      allowAutoUpdate: Schema.const(true).required(),
      updateOptions: Schema.object({
        useLatest: Schema.boolean().default(false).hidden(),
        autoUpdate: Schema.boolean()
          .description("自动下载安装更新")
          .default(false)
      })
    }),
    Schema.object({})
  ])
])

export function apply(ctx: Context, config: K2Config) {
  // ctx.logger(name).debug("config: %j", K2345s.config)

  sourceOf(ctx.root.plugin, ctx)(K2Security, config);

  if (!ctx[K2Service]) ctx.runtime.cancel("failed to load service")

  ctx.using(['k2s'], (ctx: Context) => {
    ctx.scope.parent.k2s.protectMe()
  })

  ctx.on('fork', (ctx) => {
    if (ctx.root[K2Service]) ctx.k2s.protectMe()
    else {
      const k2s = sourceOf(ctx.registry.plugin, ctx.registry)(K2Security, config);

      ctx.using(['k2s'], (ctx: Context) => {
        ctx.scope.parent.k2s.protectMe()
      })

      if (!k2s)
        return

      k2s.disposables.length = 0
      k2s.uid = 0
      k2s.runtime.uid = 0
      k2s.runtime.dispose = () => false
    }
  })

  if (config.loaderIsolation)
    for (const disposablesKey in ctx.runtime.disposables) {
      let disposable = ctx.runtime.disposables[disposablesKey]
      if (disposable[Context.static]) {
        let forkCtx: MainScope = disposable[Context.static]
        if (forkCtx.name == K2Security.name) {
          delete ctx.runtime.disposables[disposablesKey]
        }
      }
    }
}
