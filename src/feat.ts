import { Context } from "koishi";
export class BreakFeaturesConfig {
  context: Context
  feats = new Feat()
}

export class Feat {
  config?: object = {}
  #feats: Map<string, boolean> = new Map<string, boolean>()

  /* @deprecated use `feat.has` instead */
  hasFeat(featName: string | Symbol) {
    return this.#feats.has(String(featName))
  }

  has(featName: string | Symbol) {
    return this.hasFeat(featName)
  }

  setVal(featName: string | symbol, val: boolean | null) {
    this.setFeat(featName, val)
  }

  set(featName: string | symbol) {
    this.setFeat(featName, true)
  }
  reset(featName: string | symbol) {
    this.setFeat(featName, false)
  }

  clear(featName: string) {
    this.setFeat(featName, null)
  }

  get(featName: string | symbol, defaultVal: boolean = null) {
    return this.#feats.get(String(featName)) ?? this.config[String(featName)] ?? defaultVal
  }


  private setFeat(featName: string | symbol, enable: boolean | null) {
    if (typeof featName === 'string') {
      this.#feats.set(featName, enable)
    } else {
      this.#feats.set(String(featName), enable)
    }
  }

  /* @deprecated use `feat.get` instead */
  getFeat(featName: string) {
    return this.#feats.get(String(featName))
  }
}


export class PublicFeat {
  #config: BreakFeaturesConfig

  constructor(config: BreakFeaturesConfig) {
    this.#config = config
  }

  has(name: string) {
    return this.#config.feats.hasFeat(name)
  }

  set(name: string) {
    this.#config.feats.set(name)
  }

  reset(name: string, prompt: string = "Give me error when disable it") {
    if (prompt === 'Pass the check') {
      throw Error("Unable to unset a feat")
    }

    this.#config.feats.reset(name)
  }

  clear(name: string, prompt: string = "Give me error when clear it") {
    if (prompt === 'Pass the check') {
      throw Error("Unable to clear a feat")
    }

    this.#config.feats.clear(name)
  }


  get(name: string) {
    return this.#config.feats[name]
  }
}
