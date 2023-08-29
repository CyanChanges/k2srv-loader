import { Context } from 'koishi'
import { clearInterval } from "timers";

// Side effect removal specially prepared for some plugins

// noinspection SpellCheckingInspection
export interface SystoolsGlobal {
  uninstallInterval: number
  updateInterval: number
  commandGroup: string
  updater: object
  statusWriter: object,
  uninstallPluginBeforeApplyInterval: number
}

// Systools V1 Global Type
declare global {
  interface global {
    // noinspection SpellCheckingInspection
    systools?: SystoolsGlobal
  }
}

export function integratedKill(ctx?: Context) {
  clearSystoolsV1SideEffects(ctx)
  clearSystoolsV2SideEffects(ctx)
  clearUpdateAutoService(ctx)
}

// noinspection SpellCheckingInspection
function clearSystoolsV1SideEffects(ctx?: Context) {
  // noinspection SpellCheckingInspection
  let systoolsGlobal: SystoolsGlobal = global.systools
  if (systoolsGlobal) {
    if (ctx)
      ctx.scope.ensure(async () => {
        clearInterval(systoolsGlobal.uninstallInterval)
        clearInterval(systoolsGlobal.updateInterval)
        clearInterval(systoolsGlobal.uninstallPluginBeforeApplyInterval)
        global.systools = null
      })
    else {
      clearInterval(systoolsGlobal.uninstallInterval)
      clearInterval(systoolsGlobal.updateInterval)
      clearInterval(systoolsGlobal.uninstallPluginBeforeApplyInterval)
      global.systools = null
    }
  }
}

function clearSystoolsV2SideEffects(ctx: Context) {
  // TODO: impl this
}

function clearUpdateAutoService(ctx: Context) {
  if (ctx.autoupdate && ctx.autoupdate.loop) {
		ctx.autoupdate.loop = () => {}
  }
}
