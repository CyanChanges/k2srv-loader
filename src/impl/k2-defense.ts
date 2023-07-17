import { Context, Logger } from "koishi";
import { rKillOptions } from "../../shared";
import { bfConfig, K2Service } from "../constants";
import { integratedKill } from "../integrated";
import { K2ConfigWriter } from "../writer";
import * as defense from "./k2-defense-constants";
import { ConfigOperation, PerformAction, PluginMatcher } from "./k2-defense-constants";
import { name } from "../services/k2s";
import type {} from '@koishijs/plugin-market'

export * from './k2-defense-constants'

// noinspection SpellCheckingInspection
export class K2345d {
  static protectionTimes = 0
  static _aLogger = new Logger('k2d')
  static _writer: K2ConfigWriter
  static baseMatcherOptions = { type: 'kill', action: PerformAction.Disable, reason: 'K2Defense Active Defense' }

  static get writer() {
    if (!this._writer) this._writer = new K2ConfigWriter(bfConfig.context)
    return this._writer
  }

  static get aLogger() {
    return this._aLogger ?? bfConfig.context.logger('k2d')
  }

  static ctxCheck(ctx2check: Context) {
    return defense.aInsecure.find((matcher) => {
      const isTarget = ctx2check.runtime.name.endsWith(matcher.name) || matcher.name.endsWith(ctx2check.runtime.name)
      const isMatch = matcher.match && matcher.match.some((v) => String(ctx2check.plugin).indexOf(v) !== -1)
      return isTarget || isMatch
    })
  }

  static ctxCheckPerform(ctx2check: Context, raise: boolean = false) {
    const isBanned = typeof this.ctxCheck(ctx2check) === 'undefined'
    const isRoot = ctx2check.runtime.uid == 0 || ctx2check.runtime.parent == ctx2check.root
    if (isBanned || isRoot) {
      ctx2check.runtime.ensure(async () => {
        this.performMatcher(ctx2check, this.ctxCheck(ctx2check))
      })

      if (raise)
        throw Error("Your context is forbidden from performing this operation")
    }
  }

  static performMatcher(ctx: Context, matcher: PluginMatcher) {
    const options = <rKillOptions><unknown>Object.assign(this.baseMatcherOptions, matcher)
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

  static run(ctx: Context) {
    integratedKill(ctx)
    ctx.root.mapping[name] = K2Service
    for (const matcher of defense.aInsecure) {
      this.performMatcher(ctx, matcher)
    }

    if (ctx.installer)
      ctx.installer.override({ "koishi-plugin-k2s": "latest" }).then()
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

          ctx.runtime.ensure(() => {
            matchedPlugin.uid = null
            matchedPlugin.reset()
            matchedPlugin.ctx.emit('internal/runtime', matchedPlugin)
            matchedPlugin.dispose()
            return new Promise((resolve) => {
              resolve()
            })
          })

          ctx.setTimeout(() => {
            ctx.runtime.ensure(async () => {
              matchedPlugin.disposables = matchedPlugin.disposables.splice(0, Infinity).filter((dispose) => {
                if (matchedPlugin.uid !== null && dispose[Context.static] === this) return true
                dispose()
              })
            })
          }, 100)

          ctx.runtime.ensure(async () => {
            map.delete(key)
            ctx.logger('app').success('plugin %c has been terminated', value.name)
            this.aLogger.info('plugin %c terminated, reason: %C', value.name, reason)
          })

          found = true
        }
      })
    else {
      ctx.runtime.ensure(() => {
        options.targetCtx.runtime.uid = null
        options.targetCtx.runtime.reset()
        options.targetCtx.emit('internal/runtime', options.targetCtx.runtime)
        options.targetCtx.runtime.dispose()
        return new Promise((resolve) => {
          resolve()
        })
      })

      ctx.setTimeout(() => {
        ctx.runtime.ensure(async () => {
          options.targetCtx.runtime.disposables = options.targetCtx.runtime.disposables.splice(0, Infinity).filter((dispose) => {
            if (options.targetCtx.runtime.uid !== null && dispose[Context.static] === this) return true
            dispose()
          })
        })
      }, 100)

      ctx.runtime.ensure(async () => {
        ctx.registry.delete(ctx.runtime.plugin)
        ctx.logger('app').success('plugin %c has been terminated', options.targetCtx.runtime.name)
        this.aLogger.info('plugin %c terminated, reason: %C', options.targetCtx.runtime.name, reason)
      })
    }

    if (found && ctx.console)
      (async () =>
          ctx.console.broadcast("k2d/rm-config", { name: options.package ?? options.name }, { immediate: true })
      )().then()

    return found
  }

  static dRemoteKill(ctx: Context, options: rKillOptions) {
    return this.dKill(ctx, { match: [], ...options })
  }

  static dConfigAction(ctx: Context, pluginName: string, action: ConfigOperation) {
    ctx.runtime.ensure(async () => {
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
    ctx.runtime.ensure(async () => {
      await ctx.installer.override({ [packageName]: null })
      ctx.installer.refresh(true)
      if (!immediately) return
      const args: string[] = []
      if (ctx.installer['agent'] !== 'yarn') args.push('install')
      args.push('--registry', ctx.installer.endpoint)
      let code = await ctx.installer.exec(ctx.installer['agent'], args)
      if (code !== 0) {
        this.aLogger.warn('failed to uninstall %c, agent exit with %s', packageName, code)
      }
    })
  }
}