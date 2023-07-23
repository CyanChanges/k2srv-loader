<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { zhCN, enUS } from "./locales";

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

const props = defineProps({
  name: { type: String, default: () => "此页面" },
  id: { type: String, default: () => undefined }
})
</script>

<template>
  <div class="k-empty">
    <k-card>
      <h4> {{ t('unsupported.message', [props.name, props.id ? `(${props.id})` : '']) }} </h4>
      {{ t('unsupported.solution') }}
    </k-card>
  </div>
</template>

<style scoped lang="scss">
.k-card {
  color: red
}
</style>
