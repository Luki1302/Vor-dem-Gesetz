<script setup>
const props = defineProps({
  src: { type: String, required: true },
  size: { type: String, default: 'quer' },
  caption: { type: String, default: '' },
})

const videoEl = ref(null)
const isVisible = ref(false)

onMounted(() => {
  const video = videoEl.value
  if (!video) return

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!isVisible.value) {
          isVisible.value = true
          video.src = props.src
          video.load()
        }
        video.play().catch(() => {})
      } else {
        video.pause()
      }
    },
    { rootMargin: '200px' }
  )

  observer.observe(video)

  onUnmounted(() => observer.disconnect())
})
</script>

<template>
  <figure v-if="caption">
    <video
      ref="videoEl"
      :data-src="src"
      :class="size === 'quer' || size === 'voll' ? 'video-quer' : 'video-hoch'" :data-size="size"
      loop
      muted
      playsinline
      preload="none"
    />
    <figcaption>{{ caption }}</figcaption>
  </figure>
  <video
    v-else
    ref="videoEl"
    :data-src="src"
    :class="size === 'quer' || size === 'voll' ? 'video-quer' : 'video-hoch'" :data-size="size"
    loop
    muted
    playsinline
    preload="none"
  />
</template>
