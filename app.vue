<script setup>
const { mode } = useTheme()
useHead({
  htmlAttrs: computed(() => ({ 'data-theme': mode.value, lang: 'de' }))
})
</script>

<template>
  <div class="desktop-content">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <AppCursor />
  </div>
  <div class="mobile-notice">
    <h1 class="mobile-notice-title">
      <span>Vor dem</span>
      <span>Gesetz</span>
    </h1>
    <div class="mobile-notice-body">
      <p class="mobile-notice-right">ist nur für die</p>
      <p>Desktop-Ansicht</p>
      <p>geeignet.</p>
    </div>
  </div>
</template>
