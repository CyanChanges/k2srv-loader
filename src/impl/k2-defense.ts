import { Context, EffectScope } from "koishi";
import { rKillOptions } from "../../shared";
import { bfConfig, K2Service } from "../constants";
import { integratedKill } from "../integrated";
import { K2ConfigWriter } from "../writer";
import * as defense from "./k2-var";
import {
  aLogger as al,
  ConfigOperation,
  PerformAction,
  PluginMatcher
} from "./k2-var";
import { debounce } from "lodash";
import { get as getTrace } from 'stack-trace'
import type {} from '@koishijs/plugin-market'
import { readFileSync } from "fs";
import { K2345s } from "./k2-security";
import { Config } from "../shared";

export * from './k2-var'

// noinspection SpellCheckingInspection
export class K2345d {
  static counter = 0
  static _aLogger = al
  static _writer: K2ConfigWriter
  static defaultsOptions = {
    type: 'kill',
    action: PerformAction.Disable,
    reason: 'K2Defense Active Defense'
  }
  static debouncedRunOnce =
    debounce(<typeof K2345d.runOnce>K2345d.runOnce.bind(this), 500)

  static get writer() {
    if (!this._writer) this._writer = new K2ConfigWriter(bfConfig.context)
    return this._writer
  }

  static get aLogger() {
    return this._aLogger ?? bfConfig.context.logger('k2d')
  }

  static perform = class PerformClass {
    static kill(scopeKilled: EffectScope) {

    }

    static cfgUpdate(configPath: string) {

    }

    static uninstall(name: string) {

    }

    static ctxCheckFailed(ctxFailed: Context) {

    }

    static modulePathCheckFailed(reason: any) {

    }
  }

  static ctxCheck(ctx2check: Context) {
    return defense.aInsecure.find((matcher) => {
      const isTarget = ctx2check.runtime.name.endsWith(matcher.name) || matcher.name.endsWith(ctx2check.runtime.name)
      const isMatch = matcher.match && matcher.match.some((v) => String(ctx2check.plugin).indexOf(v) !== -1)
      return isTarget || isMatch
    })
  }

  static ctxCheckPerform(ctx2check: Context, raise: boolean = false, strict: boolean = false) {
    ctx2check.runtime.ensure(async () => {}) // update status hack

    const isBanned = typeof this.ctxCheck(ctx2check) !== 'undefined'
    const isRoot = ctx2check.scope.uid == 0 || ctx2check.scope.parent == ctx2check.root
    const isGreat = ctx2check.scope.status == "active" || ctx2check.runtime.status == "loading"
    const isGroup = ctx2check.runtime.name.startsWith("group:")

    if (isBanned || isRoot || isGroup || !isGreat) {
      ctx2check.runtime.ensure(async () => {
        this.performMatcher(ctx2check, this.ctxCheck(ctx2check))
      })

      if (raise)
        throw Error("Your context is forbidden from performing this operation")

      return true
    }

    if (strict) {
      if (this.checkModulePath(ctx2check)) return true
    }

    return false
  }

  static performMatcher(ctx: Context, matcher: PluginMatcher) {
    const options = <rKillOptions><unknown>Object.assign(this.defaultsOptions, matcher)
    options.name ??= matcher.package

    K2345d.dRemoteKill(ctx, options)

    switch (matcher.action) {
      case PerformAction.Unload:
        break
      case PerformAction.UninstallImmediately:
      case PerformAction.Uninstall:
        this.dConfigAction(ctx, matcher.name, ConfigOperation.Remove)
        this.dUninstall(
          ctx,
          matcher.package,
          matcher.action == PerformAction.UninstallImmediately
        )
        break
      case PerformAction.Disable:
        this.dConfigAction(ctx, matcher.name, ConfigOperation.Unload)
        break
      case PerformAction.Remove:
        this.dConfigAction(ctx, matcher.name, ConfigOperation.Remove)
        break
      case PerformAction.Pass:
        break
    }
  }

  static checkModulePath(ctx: Context): boolean {
    let trace: (NodeJS.CallSite | any)[] = getTrace()

    trace.shift()

    for (const callSite of trace) {
      let source = callSite.getFileName()
      let content = readFileSync(source, { encoding: "utf8" })
      al.debug("%C: %s", source, content)
    }

    return false
  }

  static runOnce(ctx: Context) {
    integratedKill(ctx)
    for (const matcher of defense.aInsecure) {
      this.performMatcher(ctx, matcher)
    }

    if ((<Config>ctx.config).allowAutoUpdate)
      K2345s.checkVersion(ctx, (<Config>ctx.config).updateOptions).then()
  }

  static dKill(ctx: Context, options: PluginMatcher, reason?: string) {
    let found = false

    if (!reason) {
      reason = 'K2Defense Active Defense'
    }

    if (!options.targetCtx)
      ctx.registry.forEach((value, key, map) => {
        const isTarget = value.name.endsWith(options.name) || options.name.endsWith(value.name)
        const isMatch = options.match && (options.match.some((v) => (String(key).indexOf(v) !== -1 || v.indexOf(String(key)) !== -1)))
        if (isTarget || isMatch) {
          const matchedPlugin = value

          options.name = matchedPlugin.name

          ctx.scope.ensure(() => {
            matchedPlugin.uid = null
            matchedPlugin.reset()
            matchedPlugin.ctx.emit('internal/runtime', matchedPlugin)
            matchedPlugin.dispose()
            return new Promise((resolve) => {
              resolve()
            })
          })

          ctx.setTimeout(() => {
            ctx.scope.ensure(async () => {
              matchedPlugin.disposables = matchedPlugin.disposables.splice(0, Infinity).filter((dispose) => {
                if (matchedPlugin.uid !== null && dispose[Context.static] === this) return true
                dispose()
              })
            })
          }, 100)

          ctx.scope.ensure(async () => {
            map.delete(key)
            this.perform.kill(value)
            ctx.logger('app').success('plugin %c has been terminated', value.name)
            al.info('plugin %c terminated, reason: %C', value.name, reason)
          })

          found = true
        }
      })
    else {
      ctx.scope.ensure(() => {
        options.targetCtx.runtime.uid = null
        options.targetCtx.runtime.reset()
        options.targetCtx.emit('internal/runtime', options.targetCtx.runtime)
        options.targetCtx.runtime.dispose()
        return new Promise((resolve) => {
          resolve()
        })
      })

      ctx.setTimeout(() => {
        ctx.scope.ensure(async () => {
          options.targetCtx.runtime.disposables = options.targetCtx.runtime.disposables.splice(0, Infinity).filter((dispose) => {
            if (options.targetCtx.runtime.uid !== null && dispose[Context.static] === this) return true
            dispose()
          })
        })
      }, 100)

      ctx.scope.ensure(async () => {
        ctx.registry.delete(ctx.runtime.plugin)
        this.perform.kill(options.targetCtx.scope)
        ctx.logger('app').success('plugin %c has been terminated', options.targetCtx.runtime.name)
        al.info('plugin %c terminated, reason: %C', options.targetCtx.runtime.name, reason)
      })
    }

    if (found)
      if (ctx.console)
        (async () =>
            ctx.console.broadcast("k2d/rm-config", { name: options.package ?? options.name }, { immediate: true })
        )().then()


    return found
  }

  static dRemoteKill(ctx: Context, options: rKillOptions) {
    return this.dKill(ctx, { match: [], ...options })
  }

  static dConfigAction(ctx: Context, pluginName: string, action: ConfigOperation) {
    ctx.scope.ensure(async () => {
      let root = await this.writer.get()
      let path = []

      function locate(entry: typeof root.plugins, entryKey?: string) {
        for (const key in entry) {
          if (key === pluginName || key.startsWith(`${pluginName}:`)) {
            path.push(key)
            path.push(entryKey)
            return true
          } else if (key.startsWith('group:')) {
            if (locate(entry[key], key)) {
              if (entryKey) path.push(entryKey)
              return true
            }
          }
        }
        return false
      }

      let success = locate(root.plugins)

      if (success) {
        path.reverse()
        await this.writer[action](path.join('/'))
      }
    })

  }

  static dUninstall(ctx: Context, packageName: string, immediately: boolean = false) {
    ctx.scope.ensure(async () => {
      await ctx.installer.override({ [packageName]: null })
      ctx.installer.refresh(true)
      if (!immediately) return
      const args: string[] = []
      if (ctx.installer['agent'] !== 'yarn') args.push('install')
      args.push('--registry', ctx.installer.endpoint)
      let code = await ctx.installer.exec(ctx.installer['agent'], args)
      if (code !== 0) {
        al.warn('failed to uninstall %c, agent exit with %s', packageName, code)
      }
    })
  }
}
