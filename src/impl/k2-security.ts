// noinspection JSUnusedLocalSymbols

import { Context, Dict, Logger, Random } from "koishi";
import { bfConfig, K2Origin } from "../constants";
import { K2ReloadOptions, UpdateOptions } from './k2-var'
import { awaitIfNonNull, ReturnTypeOf, sourceOf, ThisTypeOf, UnPromisify } from "../utils";
import { Awaitable } from "cosmokit";
import { Installer } from "@koishijs/plugin-market";
import { K2Security } from "../services/k2s";
import { K2Defense } from "../services/k2d";
import process from 'process'
import { perform, UID } from "./shared";
import { K2345d } from "./k2-defense";

type Prototyped = {
    prototype: object
}

// Special Thanks
// Code written by Koishi 开发群 @Giraffe(472247053)
type RawProperties<T, S> = Pick<T, {
    [K in keyof T]: T[K] extends S ? K : never
}[keyof T]>

// noinspection JSUnusedLocalSymbols
export class HookPass {
    // static get placeholder(): string {
    //     return this.#placeholder;
    // }
    //
    // static set placeholder(value: string) {
    //     this.#placeholder = value;
    // }
    // static #placeholder = 'pass'
}

export type AFunction<T extends any = any, R = any> = (...args: T[]) => R

export class K2345s {
    static logger = new Logger('k2345-security')

    static get config() {
        return bfConfig
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


    static denied(ctx: Context, message: string = "拒绝访问"): any {
        if (K2345d.ctxCheckPerform(ctx))
            return


        perform(ctx).blocked(message)

        let err = new Error(message)

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

    static hook<S extends Prototyped | RawProperties<object, AFunction>, T extends S extends Prototyped ? RawProperties<S['prototype'], AFunction> : S, K extends keyof T>(
        hookClass: S,
        hookFuncName: K,
        hookProc: {
            // @ts-ignore
            beforeHook?: (this: ThisTypeOf<T[K]>, originFunc: T[K], ...args: Parameters<T[K]>) => ReturnTypeOf<T[K]> | HookPass,
            // @ts-ignore
            afterHook?: <R extends ReturnTypeOf<T[K]>>(this: ThisTypeOf<T[K]>, result: R, ...args: Parameters<T[K]>) => R
        }) {
        const func = (hookClass['prototype'] ?? <T><unknown>hookClass)[hookFuncName]
        const originFunc: T[K] = sourceOf(func)

        function _hooked(...args: any[]) {
            let ret = hookProc.beforeHook?.call(this, originFunc, ...args)
            if (!(ret == HookPass || ret.name === HookPass.name && ret.prototype == HookPass.prototype)) return ret

            ret = (<Function><unknown>originFunc).apply(this, args)

            if (hookProc.afterHook)
                return hookProc.afterHook.call(this, ret, ...args)

            return ret
        }

        _hooked[K2Origin] = originFunc;

        (hookClass['prototype'] ?? <T><unknown>hookClass)[hookFuncName] = _hooked

        return <typeof originFunc><unknown>_hooked
    }

    static hookAsync<S extends Prototyped | RawProperties<object, AFunction>, T extends S extends Prototyped ? RawProperties<S['prototype'], AFunction> : S, K extends keyof T>(
        hookClass: S,
        hookFuncName: K,
        hookProc: {
            // @ts-ignore
            beforeHook?: (this: ThisTypeOf<T[K]>, originFunc: T[K], ...args: Parameters<T[K]>) => Awaitable<ReturnTypeOf<T[K]> | HookPass>,
            // @ts-ignore
            afterHook?: <R extends ReturnTypeOf<T[K]> | any>(this: ThisTypeOf<T[K]>, result: R, ...args: Parameters<T[K]>) => Promise<R>
        }) {
        const func = (hookClass['prototype'] ?? <T><unknown>hookClass)[hookFuncName]
        const originFunc: T[K] = sourceOf(func)

        async function _hooked(...args: any[]) {
            let ret = await hookProc.beforeHook?.call(this, originFunc, ...args)
            if (!(ret == HookPass || ret.name === HookPass.name && ret.prototype == HookPass.prototype)) return ret

            ret = (originFunc as Function).apply(this, args)

            let result2ret: Awaited<ReturnTypeOf<T[K]>> = await ret

            if (hookProc.afterHook)
                return hookProc.afterHook.call(this, result2ret, ...args)

            return result2ret
        }

        _hooked[K2Origin] = originFunc;

        (hookClass['prototype'] ?? <T><unknown>hookClass)[hookFuncName] = _hooked

        return <typeof originFunc><unknown>_hooked
    }


    static async selfUpdate(ctx: Context, deps: Dict<string>) {
        ctx.using(['installer'], async (ctx) => {
            let ret = await ctx.installer.install(deps)
            if (ret != 0)
                ctx.runtime.cancel(`installation failed with exit code: ${ret}`)
        })
    }

    static async installerGetDeps(ctx: Context): ReturnTypeOf<InstanceType<typeof Installer>['getDeps']> {
        if (ctx.installer)
            return await ctx.installer.getDeps() ??
                await awaitIfNonNull(ctx.installer['_getDeps']) ??
                ctx.installer['manifest'].dependencies
        else
            return await ctx.console.dependencies.get()
    }

    static async selfReload(options: K2ReloadOptions, oldDeps: UnPromisify<ReturnTypeOf<InstanceType<typeof Installer>['getDeps']>>) {
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
        let action = async (ctx: Context) => {
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
        };

        if (!ctx.installer)
            ctx.using(['installer'], action)
        else
            await action(ctx)
    }

    static hookContext<T extends Context, K extends keyof RawProperties<typeof Context['prototype'], AFunction>>(
        hookFuncName: K,
        hookProc: {
            beforeHook?: (this: ThisTypeOf<T[K]>, originFunc: T[K], ...args: Parameters<T[K]>) => ReturnTypeOf<T[K]> | HookPass,
            afterHook?: <R extends ReturnTypeOf<T[K]>>(this: ThisTypeOf<T[K]>, result: R, ...args: Parameters<T[K]>) => R
        }): { hooked: T[K], origin: T[K] } {
        const hooked = this.hook(Context['prototype'], hookFuncName, hookProc)

        // @ts-ignore
        return { hooked, origin: sourceOf(Context.prototype[hookFuncName]) }
    }
}
