import { Context } from "koishi";
import { bfConfig, K2Service, name as k2sName } from "../constants";
import { HookPass, K2345s } from "./k2-security";
import { Parameters, ReturnType, UnPromisify } from "../utils";
import { K2ConfigWriter } from "../writer";
import { integratedKill } from "../integrated";
import { K2345d } from "./k2-defense";

const surelySecure = (rootCtx: Context) => {
  bfConfig.context = rootCtx
  integratedKill(rootCtx)
}

let pullUpAction = (async (rootCtx: Context) => {
  if (!pullUpAction['perform'])
    pullUpAction['perform'] = true
  else return

  setTimeout(() => {
    K2345d.run(rootCtx)
  }, 1000)

  const writer = new K2ConfigWriter(rootCtx)
  let cancel = false
  let root = <UnPromisify<ReturnType<typeof writer.get>>>await (writer.get().catch(() => {
    cancel = true
  }))
  if (cancel) return
  let path = []

  function locate(entry: typeof root.plugins, entryKey?: string) {
    for (const key in entry) {
      if (key === k2sName || key.startsWith(`${k2sName}:`) || key.startsWith(`~${k2sName}:`)) {
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
    await writer.reload(path.join('/'), null, null)
  }
})

K2345s.hook(Context, 'emit', {
  beforeHook: function (
    this: Context,
    originFunc: typeof Context.prototype.emit,
    ...args: Parameters<typeof Context.prototype.emit>
  ) {
    if (this.root)
      surelySecure(this.root)

    let k2Service = this.root[K2Service]
    if (!k2Service && this && this.root) {
      try {
        pullUpAction(this.root).then()
      } catch {
      }
    }
    return HookPass
  }
})

K2345s.hookAsync(Context, 'parallel', {
  beforeHook: async function (
    this: Context,
    originFunc: typeof Context.prototype.emit,
    ...args: Parameters<typeof Context.prototype.emit>
  ) {
    if (this.root)
      surelySecure(this.root)

    let k2Service = this.root[K2Service]
    if (!k2Service) {
      try {
        await pullUpAction(this.root)
      } catch {
      }
    }
    return HookPass
  }
})

K2345s.hook(Context, 'bail', {
  beforeHook: function (
    this: Context,
    originFunc: typeof Context.prototype.bail,
    ...args: Parameters<typeof Context.prototype.bail>
  ) {
    if (this.root)
      surelySecure(this.root)
    let k2Service = this.root[K2Service]
    if (!k2Service && this && this.root) {
      try {
        pullUpAction(this.root).then()
      } catch {
      }
    }
    return HookPass
  }
})

K2345s.hookAsync(Context, 'serial', {
  beforeHook: async function (
    this: Context,
    originFunc: typeof Context.prototype.bail,
    ...args: Parameters<typeof Context.prototype.bail>
  ) {
    if (this.root)
      surelySecure(this.root)
    let k2Service = this.root[K2Service]
    if (!k2Service && this && this.root) {
      try {
        await pullUpAction(this.root)
      } catch {
      }
    }
    return HookPass
  }
})
