import { UpdateOptions } from "./impl/k2-var";

export interface Config {
  allowOperate: boolean,
  allowSelfDefense: boolean,
  allowAutoUpdate: boolean,
  allowEarlySelfDefense: boolean,
  loaderIsolation: boolean,
  updateOptions: this['allowAutoUpdate'] extends true ? UpdateOptions : never
}
