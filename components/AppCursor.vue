<script setup>
const el = ref(null)

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
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  document.removeEventListener('mouseleave', onLeave)
})
</script>

<template>
  <div ref="el" class="custom-cursor" />
</template>
