export type * from '@koishijs/plugin-console'

export type k2sEventType = 'protect' | 'notice'

export interface remoteOptions {
  type: string
}

export interface rKillOptions extends remoteOptions {
  type: 'kill'
  shortName: string
  package?: string
  reason?: string
  match?: string[]
}

export type k2sEvent = {
  type: k2sEventType,
  title?: string,
  message: string,
  registryName: string,
  hookedName: string,
  timestamp: number
}

declare module '@koishijs/plugin-console' {
  interface Events {
    'k2d/action'(options: remoteOptions): any
    'k2d/kill'(options: rKillOptions): boolean
  }
}

export interface k2Context {
  injected: boolean
}
