import {Context, Dict, MainScope, Schema} from 'koishi'
import path from 'path'
import {readFileSync} from 'fs'
import {K2Security} from "./services/k2s"
import {K2Service, name} from "./constants"
import type {Config as K2Config} from './shared'
import {sourceOf} from "./utils";
import type {} from 'koishi-plugin-keine'

export {name} from './constants'

export * from './services/k2s'
export * from './services/k2d'

const _using = ['keine']

export { _using as using }

export const usage = readFileSync(path.resolve(
    __dirname,
    "./usage.md"
)).toString()

export type {K2Config}

export const Config = Schema.intersect([
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

    ctx.keine.plugin(K2Security, config)
    ctx.registry.delete(ctx.plugin)
}
