declare module 'zh-CN.yml' {
  const content: {}
  // @ts-ignore
  export default content
}

declare module 'en-US.yml' {
  const content: {}
  // @ts-ignore
  export default content
}

export * as zhCN from './zh-CN.yml'
export * as enUS from './en-US.yml'
