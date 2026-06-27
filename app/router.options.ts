import type { RouterConfig } from '@nuxt/schema'

declare global {
  interface Window { __savedHomeScroll?: number }
}

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (from.path === '/') {
      return { top: 0 }
    }
    if (to.path === '/') {
      const scrollY = window.__savedHomeScroll ?? 0
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ top: scrollY })
        }, 50)
      })
    }
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return { el: to.hash, behavior: 'smooth', top: 16 }
    }
    return { top: 0 }
  },
}
