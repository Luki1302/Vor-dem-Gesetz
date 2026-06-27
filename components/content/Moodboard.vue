<script setup>
defineProps({
  items: { type: Array, required: true },
})

const isVideo = (src) => src.endsWith('.webm') || src.endsWith('.mp4')

const containerRef = ref(null)

onMounted(() => {
  if (!containerRef.value) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const el = entry.target
        if (entry.isIntersecting) {
          if (!el.src && el.dataset.src) {
            el.src = el.dataset.src
            el.load()
          }
          el.play().catch(() => {})
        } else {
          el.pause()
        }
      })
    },
    { rootMargin: '300px' }
  )

  containerRef.value.querySelectorAll('video').forEach((el) => {
    observer.observe(el)
  })

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <div ref="containerRef" class="moodboard" :data-items="JSON.stringify(items)">
    <template v-for="src in items" :key="src">
      <video
        v-if="isVideo(src)"
        :data-src="src"
        loop
        muted
        playsinline
        preload="none"
        class="w-full h-auto"
      />
      <img v-else :src="src" alt="" loading="lazy" class="w-full h-auto" />
    </template>
  </div>
</template>
