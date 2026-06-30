<script setup>
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: '' },
  caption: { type: String, default: '' },
  size: { type: String, default: 'quer' },
  dark: { type: String, default: '' },
})

const isDark = ref(false)

onMounted(() => {
  const update = () => {
    isDark.value = document.documentElement.getAttribute('data-theme') === 'dark'
  }
  update()
  const observer = new MutationObserver(update)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  onUnmounted(() => observer.disconnect())
})

const currentSrc = computed(() => {
  if (props.dark && isDark.value) return props.dark
  return props.src
})
</script>

<template>
  <figure :class="size === 'quer' ? 'figure-quer' : ''">
    <img
      :src="currentSrc"
      :data-dark="dark || undefined"
      :data-light="dark ? src : undefined"
      :alt="alt"
      :class="size === 'voll' || size === 'full' ? 'w-full' : size === 'xs' ? 'img-xs' : size === 'mini' ? 'img-mini' : size === 'klein' ? 'img-klein' : size === 'halb' || size === 'hoch' ? 'w-1/2' : 'img-quer'"
      loading="lazy"
    />
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>
