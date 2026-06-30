<script setup>
const { mode, setMode } = useTheme()
function toggle() {
  setMode(mode.value === 'light' ? 'dark' : 'light')
}
</script>

<template>
  <button class="theme-toggle" title="Farbmodus" @click="toggle">
    <span :class="{ active: mode === 'light' }">○</span>
    <span :class="{ active: mode === 'dark' }">●</span>
  </button>
</template>
