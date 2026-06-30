<script setup>
const visible = ref(false)
const items = ref([])
const currentIndex = ref(0)
const mediaSize = ref(null)

const current = computed(() => items.value[currentIndex.value] || null)

function open(mediaItems, startIndex = 0) {
  items.value = mediaItems
  currentIndex.value = startIndex
  mediaSize.value = null
  visible.value = true
  document.body.style.overflow = 'hidden'
}

function close() {
  visible.value = false
  document.body.style.overflow = ''
  window.__setCursorMode?.('full')
}

function next() {
  currentIndex.value = (currentIndex.value + 1) % items.value.length
  mediaSize.value = null
}

function prev() {
  currentIndex.value = (currentIndex.value - 1 + items.value.length) % items.value.length
  mediaSize.value = null
}

function computeSize(naturalW, naturalH) {
  if (!naturalW || !naturalH) return null
  const maxH = window.innerHeight * 0.85
  const maxW = window.innerWidth * 0.85
  let h = maxH
  let w = h * (naturalW / naturalH)
  if (w > maxW) {
    w = maxW
    h = w * (naturalH / naturalW)
  }
  return { width: `${w}px`, height: `${h}px` }
}

function onMediaLoad(e) {
  const el = e.target
  const naturalW = el.naturalWidth || el.videoWidth
  const naturalH = el.naturalHeight || el.videoHeight
  mediaSize.value = computeSize(naturalW, naturalH)
}

function onResize() {
  const el = document.querySelector('.lightbox-media')
  if (!el) return
  const naturalW = el.naturalWidth || el.videoWidth
  const naturalH = el.naturalHeight || el.videoHeight
  mediaSize.value = computeSize(naturalW, naturalH)
}

function onMediaClick(e) {
  if (items.value.length <= 1) {
    close()
    return
  }
  const rect = e.currentTarget.getBoundingClientRect()
  const x = e.clientX - rect.left
  const isRight = x > rect.width / 2
  if (isRight) next()
  else prev()
}

function onOverlayClick(e) {
  if (!e.target.closest('.lightbox-media')) close()
}

function onMouseMove(e) {
  if (!visible.value) return
  const el = document.querySelector('.lightbox-media')
  if (!el) return
  const rect = el.getBoundingClientRect()
  const inside = e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
  if (!inside) {
    window.__setCursorMode?.('full')
    return
  }
  const x = e.clientX - rect.left
  const isRight = x > rect.width / 2
  if (items.value.length <= 1) {
    window.__setCursorMode?.('full')
  } else {
    window.__setCursorMode?.(isRight ? 'right-half' : 'left-half')
  }
}

function onKeydown(e) {
  if (!visible.value) return
  if (e.key === 'Escape') close()
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

onMounted(() => {
  window.__openLightbox = open
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('resize', onResize, { passive: true })

  document.addEventListener('click', (e) => {
    const slot = document.querySelector('.detail-media-slot.active')
    if (!slot) return
    const target = e.target.closest('.detail-media-slot.active img, .detail-media-slot.active video')
    if (!target) return
    if (target.closest('.media-caption')) return

    const allMedia = [...slot.querySelectorAll('img, video')]
      .filter(el => el.src && !el.closest('.media-caption'))
      .map(el => ({ type: el.tagName === 'VIDEO' ? 'video' : 'image', src: el.src }))
    if (!allMedia.length) return

    const idx = allMedia.findIndex(m => m.src === target.src)
    open(allMedia, idx >= 0 ? idx : 0)
  })
})

onUnmounted(() => {
  delete window.__openLightbox
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" class="lightbox-overlay" @click="onOverlayClick">
      <img
        v-if="current?.type === 'image'"
        :key="current.src"
        :src="current.src"
        class="lightbox-media"
        :class="{ measuring: !mediaSize }"
        :style="mediaSize || {}"
        @load="onMediaLoad"
        @click.stop="onMediaClick"
      />
      <video
        v-else-if="current?.type === 'video'"
        :key="current.src"
        :src="current.src"
        class="lightbox-media"
        :class="{ measuring: !mediaSize }"
        :style="mediaSize || {}"
        autoplay
        loop
        muted
        playsinline
        @loadedmetadata="onMediaLoad"
        @click.stop="onMediaClick"
      />
      <div v-if="items.length > 1" class="lightbox-counter">{{ currentIndex + 1 }} / {{ items.length }}</div>
    </div>
  </Teleport>
</template>
