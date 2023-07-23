import { Context } from 'koishi'
import { clearInterval } from "timers";

// noinspection SpellCheckingInspection
export interface SystoolsGlobal {
  uninstallInterval: number
  updateInterval: number
  commandGroup: string
  updater: object
  statusWriter: object,
  uninstallPluginBeforeApplyInterval: number
}

declare global {
  interface global {
    // noinspection SpellCheckingInspection
    systools?: SystoolsGlobal
  }
}

export function integratedKill(ctx?: Context) {
  clearSystoolsSideEffects(ctx)
}

// noinspection SpellCheckingInspection
function clearSystoolsSideEffects(ctx?: Context) {
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
