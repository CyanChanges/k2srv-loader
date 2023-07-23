import { Context, Logger } from "koishi";
import type { K2Security } from "../services/k2s";
import type { K2Defense } from "../services/k2d";

export enum PerformAction {
  Uninstall = 'uninstall',
  UninstallImmediately = 'uninstallImmediately',
  Unload = 'unload',
  Disable = 'disable',
  Remove = 'remove',
  Pass = 'pass' // pass more action
}

export interface PluginMatcher {
  name: string
  package?: string
  match: string[],
  targetCtx?: Context
  action?: PerformAction
}


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

export const aInsecure: PluginMatcher[] = [{
  name: 'systools',
  package: 'koishi-plugin-systools',
  match: ['systools'],
  action: PerformAction.Disable
}, {
  name: 'milk-ikun',
  package: 'koishi-plugin-milk-ikun',
  match: ['milk-ikun']
}, {
  name: 'boom',
  package: 'koishi-plugin-boom',
  match: ['boom', 'boom2']
}, {
  name: 'boom2',
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
