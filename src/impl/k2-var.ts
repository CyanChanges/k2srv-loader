import { Context, Logger } from "koishi";
import type { K2Security } from "../services/k2s";
import type { K2Defense } from "../services/k2d";

export enum PerformAction {
  Pass = 'pass', // do nothing (may not work
  Unload = 'unload', // unload in koishi
  Disable = 'disable', // disable in koishi config file
  Remove = 'remove', // remove in koishi config file
  Uninstall = 'uninstall', // Remove from package.json
  UninstallImmediately = 'uninstallImmediately' // do pm install
}

export interface PluginPerformer {
  shortName: string
  package?: string
  match: string[],
  targetCtx?: Context
  action?: PerformAction
}

export type PluginMatcher = Omit<PluginPerformer, "action">

export enum ConfigOperation {
  Unload = 'unload',
  Remove = 'remove'
}

export enum ProtectionType {
  active,
  realTime,
  passive
}

export const aLogger = new Logger('k2d')

// noinspection SpellCheckingInspection
export const aInsecure: PluginPerformer[] = [{
  shortName: 'systools',
  package: 'koishi-plugin-systools',
  match: [],
  action: PerformAction.Disable
}, {
  shortName: 'milk-ikun',
  package: 'koishi-plugin-milk-ikun',
  match: ['milk-ikun']
}, {
  shortName: 'boom',
  package: 'koishi-plugin-boom',
  match: ['boom', 'boom2']
}, {
  shortName: 'boom2',
  package: 'koishi-plugin-boom2',
  match: ['boom2']
}]

export interface UpdateOptions {
  useLatest: boolean
  autoUpdate: boolean
}

export type K2ReloadOptions = { [x: string]: (Context | K2Security | K2Defense) } & {
  ctx: Context
}
