<script setup>
const el = ref(null)
const cursorMode = ref('full')

function onMove(e) {
  if (el.value) {
    el.value.style.opacity = '1'
    const half = el.value.offsetWidth / 2
    el.value.style.transform = `translate(${e.clientX - half}px, ${e.clientY - half}px) rotate(45deg)`
  }
}

function onLeave() {
  if (el.value) el.value.style.opacity = '0'
}

onMounted(() => {
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
  }
  window.__setCursorMode = (mode) => { cursorMode.value = mode }
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseleave', onLeave)
  delete window.__setCursorMode
})
</script>

<template>
  <div ref="el" class="custom-cursor" :class="cursorMode">
    <span class="cursor-line cursor-top" />
    <span class="cursor-line cursor-right" />
    <span class="cursor-line cursor-bottom" />
    <span class="cursor-line cursor-left" />
  </div>
</template>
