import { BreakFeaturesConfig } from "./feat";

export const K2Service = Symbol("k2s")

export const K2Origin = Symbol.for("k2-origin")
export let bfConfig: BreakFeaturesConfig = new BreakFeaturesConfig()

export const name = 'k2srv-loader'
