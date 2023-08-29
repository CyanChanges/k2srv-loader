import { Context, EffectScope } from "koishi";

export type UID = string

const defaultUID: UID = 'default'

export class PerformClass {
  constructor(protected uid: UID) {}

  kill(scopeKilled: EffectScope) {

  }

  cfgUpdate(configPath: string) {

  }

  uninstall(name: string) {

  }

  ctxCheckFailed(ctxFailed: Context) {

  }

  modulePathCheckFailed(reason: any) {

  }

  blocked(message?: string) {

  }
}

export const toPerform = new PerformClass(defaultUID)

// create Performer from UID(Using ID)
export function perform(uid: UID): PerformClass

// create Performer from eContext(Executor Context)
export function perform(eCtx: Context): PerformClass

export function perform(arg1: UID | Context) {
  if (arg1 instanceof Context) {
    return new PerformClass(defaultUID)
  } else {
    return new PerformClass(arg1 ?? defaultUID)
  }
}
