<script setup>
const { mode, setMode } = useTheme()
</script>

<template>
  <div class="theme-toggle" title="Farbmodus">
    <button :class="{ active: mode === 'light' }" @click="setMode('light')" title="Light">○</button>
    <button :class="{ active: mode === 'dark' }" @click="setMode('dark')" title="Dark">●</button>
  </div>
</template>
