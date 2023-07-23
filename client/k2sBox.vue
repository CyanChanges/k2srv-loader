<script setup lang="ts">
import K2sNotice from "./k2sNotice.vue";

import type {} from '../shared'

import { watchEffect } from 'vue'
import { Context, message, receive, root, store } from '@koishijs/client'

import { useI18n } from "vue-i18n";
import { zhCN, enUS } from "./locales";

receive("k2d/rm-config", (data: { name: string }) => {
  delete store.packages[data.name]
})

if (!(<Context & { k2s?: any }>root).k2s) {
  (<Context & { k2s?: any }>root).k2s = { injected: false }
}

const { t, setLocaleMessage } = useI18n({
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
  },
})

if (import.meta.hot) {
  import.meta.hot.accept('./locales/zh-CN.yml', (module) => {
    setLocaleMessage('zh-CN', module.default)
  })
  import.meta.hot.accept('./locales/en-US.yml', (module) => {
    setLocaleMessage('en-US', module.default)
  })
}

watchEffect(() => {
  if ((<Context & { k2s: any }>root).k2s && !(<Context & { k2s: any }>root).k2s.injected) {
    setTimeout(() => {
      message.info({ message: t('messages.serviceActiveNotice') })
    });

    (<Context & { k2s: any }>root).k2s.injected = true
  }
}, { "flush": 'post' })

</script>

<template>
  <k2s-notice v-if="false"></k2s-notice>
</template>

<style scoped lang="scss">
.k2s-history {
  margin: 1.25rem;
  padding: 1.25rem;
  border: 1px solid var(--k-color-success-shade);
  border-radius: 8px;
  bottom: 0.5rem;
}
</style>
