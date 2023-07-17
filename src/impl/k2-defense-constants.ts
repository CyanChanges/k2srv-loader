import { Context } from "koishi";

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
