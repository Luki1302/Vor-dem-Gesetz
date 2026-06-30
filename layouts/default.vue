<script setup>
const route = useRoute()

const pageTitle = computed(() => {
  const path = route.path
  if (path.includes('prozess')) return 'Prozessdokumentation'
  if (path.includes('kulturgeschichtlich')) return 'Kulturgeschichtliche Thesis'
  return ''
})

onMounted(() => { window.__setCursorMode?.('full') })

function setCursorLeft() { window.__setCursorMode?.('left-half') }
function setCursorFull() { window.__setCursorMode?.('full') }
</script>

<template>
  <div>
    <header class="topbar">
      <NuxtLink to="/" class="topbar-back" title="Zurück" @mouseenter="setCursorLeft" @mouseleave="setCursorFull" @click="setCursorFull">
        <span class="back-diamond"></span>
      </NuxtLink>

      <span class="topbar-page-title">{{ pageTitle }}</span>

      <div class="topbar-right">
        <div class="mode-toggle"><ThemeToggle /></div>
      </div>
    </header>

    <slot />
  </div>
</template>
