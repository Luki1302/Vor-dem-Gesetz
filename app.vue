<script setup>
const { mode } = useTheme()
useHead({
  htmlAttrs: computed(() => ({ 'data-theme': mode.value, lang: 'de' })),
})
</script>

<template>
  <div class="desktop-content">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <ImageLightbox />
    <AppCursor />
  </div>
  <div class="mobile-notice">
    <p>«Vor dem Gesetz» ist nur für die Desktop-Ansicht geeignet.</p>
  </div>
</template>
