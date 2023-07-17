import { Context } from '@koishijs/client'
import { hide, patchEdge, inject, securityPatch, externalPatch } from "./utils";


export default (ctx: Context) => {
  console.log('load')
  hide(ctx)
  patchEdge(ctx)
  inject(ctx)
  securityPatch(ctx)
  externalPatch(ctx)
}
