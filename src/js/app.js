// Shared runtime: theme, custom cursor, lightbox, link navigation with fade
// transition and scroll restoration. Ported 1:1 from the Vue app shell
// (app.vue, useTheme, ThemeToggle, AppCursor, ImageLightbox, router.options).

// ── THEME ───────────────────────────────────────────────────────────────────
// In Nuxt the theme defaulted to the system preference and followed system
// changes. The pre-paint inline script in <head> already set data-theme.

const themeListeners = new Set()

function getTheme() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
}

function setTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode)
  try {
    localStorage.setItem('theme', mode)
  } catch (e) {}
  themeListeners.forEach((fn) => fn(mode))
}

function syncToggle(btn) {
  const mode = getTheme()
  const light = btn.querySelector('[data-theme-light]')
  const dark = btn.querySelector('[data-theme-dark]')
  if (light) light.classList.toggle('active', mode === 'light')
  if (dark) dark.classList.toggle('active', mode === 'dark')
}

function initTheme() {
  // Follow system changes (only when user hasn't explicitly chosen — match
  // original behaviour, which always followed system changes).
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  mq.addEventListener('change', (e) => {
    setTheme(e.matches ? 'dark' : 'light')
  })

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    syncToggle(btn)
    themeListeners.add(() => syncToggle(btn))
    btn.addEventListener('click', () => {
      setTheme(getTheme() === 'light' ? 'dark' : 'light')
    })
  })
}

export function onThemeChange(fn) {
  themeListeners.add(fn)
}

// ── CUSTOM CURSOR ────────────────────────────────────────────────────────────

function initCursor() {
  const el = document.querySelector('[data-cursor]')
  if (!el) return
  let cursorMode = 'full'

  const applyMode = () => {
    el.className = 'custom-cursor ' + cursorMode
  }

  function onMove(e) {
    el.style.opacity = '1'
    const half = el.offsetWidth / 2
    el.style.transform = `translate(${e.clientX - half}px, ${e.clientY - half}px) rotate(45deg)`
  }
  function onLeave() {
    el.style.opacity = '0'
  }

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
  }

  window.__setCursorMode = (mode) => {
    cursorMode = mode
    applyMode()
  }

  // Wire hover zones declared in markup (data-cursor-right / -left).
  document.querySelectorAll('[data-cursor-right]').forEach((node) => {
    node.addEventListener('mouseenter', () => window.__setCursorMode?.('right-half'))
    node.addEventListener('mouseleave', () => window.__setCursorMode?.('full'))
  })
  document.querySelectorAll('[data-cursor-left]').forEach((node) => {
    node.addEventListener('mouseenter', () => window.__setCursorMode?.('left-half'))
    node.addEventListener('mouseleave', () => window.__setCursorMode?.('full'))
    node.addEventListener('click', () => window.__setCursorMode?.('full'))
  })
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────

function initLightbox() {
  const rootHost = document.querySelector('[data-lightbox-root]')
  if (!rootHost) return

  let visible = false
  let items = []
  let currentIndex = 0
  let mediaSize = null
  let overlayEl = null
  // Ton nur, wenn der Aufrufer ihn ausdrücklich anfordert (open(..., { sound: true })).
  // Die Medien der Prozess-/Thesis-Seiten bleiben dadurch unverändert stumm.
  let soundOn = false

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

  function currentItem() {
    return items[currentIndex] || null
  }

  function render() {
    if (!visible) {
      rootHost.innerHTML = ''
      overlayEl = null
      return
    }
    const cur = currentItem()
    const overlay = document.createElement('div')
    overlay.className = 'lightbox-overlay'
    overlay.addEventListener('click', onOverlayClick)

    let media = null
    if (cur?.type === 'image') {
      media = document.createElement('img')
      media.src = cur.src
      media.className = 'lightbox-media' + (mediaSize ? '' : ' measuring')
      media.addEventListener('load', onMediaLoad)
    } else if (cur?.type === 'video') {
      media = document.createElement('video')
      media.src = cur.src
      media.className = 'lightbox-media' + (mediaSize ? '' : ' measuring')
      media.autoplay = true
      media.loop = true
      media.muted = !soundOn
      media.playsInline = true
      media.addEventListener('loadedmetadata', onMediaLoad)
    }
    if (media) {
      if (mediaSize) {
        media.style.width = mediaSize.width
        media.style.height = mediaSize.height
      }
      media.addEventListener('click', (e) => {
        e.stopPropagation()
        onMediaClick(e)
      })
      overlay.appendChild(media)
    }
    if (items.length > 1) {
      const counter = document.createElement('div')
      counter.className = 'lightbox-counter'
      counter.textContent = `${currentIndex + 1} / ${items.length}`
      overlay.appendChild(counter)
    }
    rootHost.innerHTML = ''
    rootHost.appendChild(overlay)
    overlayEl = overlay

    if (soundOn && media && media.tagName === 'VIDEO') {
      // Die Lightbox öffnet immer aus einem Klick heraus, Ton-Autoplay ist
      // daher normalerweise erlaubt. Falls der Browser trotzdem blockt,
      // läuft das Video stumm weiter statt gar nicht.
      const played = media.play()
      if (played && typeof played.catch === 'function') {
        played.catch(() => {
          media.muted = true
          media.play().catch(() => {})
        })
      }
    }
  }

  function open(mediaItems, startIndex = 0, opts = {}) {
    items = mediaItems
    currentIndex = startIndex
    mediaSize = null
    soundOn = opts.sound === true
    visible = true
    document.body.style.overflow = 'hidden'
    render()
    window.dispatchEvent(new CustomEvent('lightbox:open'))
  }
  function close() {
    if (!visible) return
    visible = false
    soundOn = false
    document.body.style.overflow = ''
    window.__setCursorMode?.('full')
    render()
    window.dispatchEvent(new CustomEvent('lightbox:close'))
  }
  function next() {
    currentIndex = (currentIndex + 1) % items.length
    mediaSize = null
    render()
  }
  function prev() {
    currentIndex = (currentIndex - 1 + items.length) % items.length
    mediaSize = null
    render()
  }

  function onMediaLoad(e) {
    const el = e.target
    const naturalW = el.naturalWidth || el.videoWidth
    const naturalH = el.naturalHeight || el.videoHeight
    mediaSize = computeSize(naturalW, naturalH)
    if (mediaSize) {
      el.classList.remove('measuring')
      el.style.width = mediaSize.width
      el.style.height = mediaSize.height
    }
  }
  function onResize() {
    const el = rootHost.querySelector('.lightbox-media')
    if (!el) return
    const naturalW = el.naturalWidth || el.videoWidth
    const naturalH = el.naturalHeight || el.videoHeight
    mediaSize = computeSize(naturalW, naturalH)
    if (mediaSize) {
      el.style.width = mediaSize.width
      el.style.height = mediaSize.height
    }
  }
  function onMediaClick(e) {
    if (items.length <= 1) {
      close()
      return
    }
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    if (x > rect.width / 2) next()
    else prev()
  }
  function onOverlayClick(e) {
    if (!e.target.closest('.lightbox-media')) close()
  }
  function onMouseMove(e) {
    if (!visible) return
    const el = rootHost.querySelector('.lightbox-media')
    if (!el) return
    const rect = el.getBoundingClientRect()
    const inside =
      e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom
    if (!inside) {
      window.__setCursorMode?.('full')
      return
    }
    const x = e.clientX - rect.left
    const isRight = x > rect.width / 2
    if (items.length <= 1) window.__setCursorMode?.('full')
    else window.__setCursorMode?.(isRight ? 'right-half' : 'left-half')
  }
  function onKeydown(e) {
    if (!visible) return
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight') next()
    if (e.key === 'ArrowLeft') prev()
  }

  window.__openLightbox = open
  window.__closeLightbox = close
  window.__lightboxOpen = () => visible
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
      .filter((el) => el.src && !el.closest('.media-caption'))
      .map((el) => ({ type: el.tagName === 'VIDEO' ? 'video' : 'image', src: el.src }))
    if (!allMedia.length) return
    const idx = allMedia.findIndex((m) => m.src === target.src)
    open(allMedia, idx >= 0 ? idx : 0)
  })
}

// ── NAVIGATION (fade transition + scroll restoration) ────────────────────────
// Replaces Nuxt's pageTransition (fade, out-in) and router.options
// scrollBehavior. SPA-style fade between the three pages.

function initNavigation() {
  if (!('fetch' in window)) return

  // Save home scroll position before leaving home.
  const isHome = location.pathname === '/' || location.pathname === '/index.html'
  if (isHome) {
    window.addEventListener(
      'scroll',
      () => {
        window.__savedHomeScroll = window.scrollY
        try {
          sessionStorage.setItem('homeScroll', String(window.scrollY))
        } catch (e) {}
      },
      { passive: true },
    )
  }

  document.querySelectorAll('a[data-link]').forEach((a) => {
    a.addEventListener('click', (e) => {
      // Allow modified clicks / new tab.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
      const href = a.getAttribute('href')
      if (!href || href.startsWith('http')) return
      e.preventDefault()
      navigateTo(href)
    })
  })
}

function navigateTo(href) {
  const wrap = document.querySelector('.desktop-content')
  if (wrap) {
    wrap.style.transition = 'opacity 0.3s ease'
    wrap.style.opacity = '0'
    setTimeout(() => {
      location.href = href
    }, 300)
  } else {
    location.href = href
  }
}

// Restore home scroll when arriving back at home.
function initScrollRestore() {
  const isHome = location.pathname === '/' || location.pathname === '/index.html'
  if (!isHome) return
  let scrollY = window.__savedHomeScroll
  if (scrollY == null) {
    try {
      const s = sessionStorage.getItem('homeScroll')
      if (s != null) scrollY = parseInt(s, 10)
    } catch (e) {}
  }
  if (scrollY && performance.getEntriesByType('navigation')[0]?.type !== 'reload') {
    // Match the original 50ms delayed restore.
    setTimeout(() => window.scrollTo({ top: scrollY }), 50)
  }
}

// Page-enter fade-in (mirror fade-enter transition).
function initEnterFade() {
  const wrap = document.querySelector('.desktop-content')
  if (!wrap) return
  wrap.style.opacity = '0'
  requestAnimationFrame(() => {
    wrap.style.transition = 'opacity 0.3s ease'
    wrap.style.opacity = '1'
  })
}

// ── IDLE-ATTRACT ─────────────────────────────────────────────────────────────
// Nach 40 s ohne Eingabe kehrt die Site zum Video der gestalterischen Thesis
// zurück – nicht im Grossbildmodus, sondern zentriert auf der normalen Seite.
// Der Wechsel nutzt dieselbe Fade-Blende wie die Navigation.
//
// Die Seite selbst meldet sich dafür über zwei Hooks an:
//   window.__gestaltCenterVideo()   scrollt das Video mittig in den Viewport
//   window.__gestaltVideoCentered() true, wenn es dort bereits steht

const IDLE_MS = 40000
const IDLE_PATH = '/gestalterisch'
const IDLE_FLAG = 'idleToVideo'

let idleTimer = null
let idleRunning = false

function onIdlePath() {
  return location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '') === IDLE_PATH
}

// Blendet den Inhalt aus, führt fn aus und blendet wieder ein – identische
// Dauer/Kurve wie der Seitenwechsel, damit sich beides gleich anfühlt.
function fadeSwap(fn) {
  const wrap = document.querySelector('.desktop-content')
  if (!wrap) {
    fn()
    return
  }
  wrap.style.transition = 'opacity 0.3s ease'
  wrap.style.opacity = '0'
  setTimeout(() => {
    fn()
    requestAnimationFrame(() => {
      wrap.style.opacity = '1'
      idleRunning = false
      resetIdleTimer()
    })
  }, 300)
}

function runIdleAttract() {
  if (idleRunning) return
  idleRunning = true

  const wasOpen = window.__lightboxOpen?.() === true
  if (wasOpen) window.__closeLightbox?.()

  if (onIdlePath() && window.__gestaltCenterVideo) {
    // Steht das Video schon mittig und war die Lightbox zu, ist nichts zu tun –
    // sonst würde die Seite im Leerlauf alle 40 s grundlos blinken.
    if (!wasOpen && window.__gestaltVideoCentered?.() === true) {
      idleRunning = false
      resetIdleTimer()
      return
    }
    fadeSwap(() => window.__gestaltCenterVideo())
    return
  }

  try {
    sessionStorage.setItem(IDLE_FLAG, '1')
  } catch (e) {}
  navigateTo(IDLE_PATH)
}

function resetIdleTimer() {
  clearTimeout(idleTimer)
  idleTimer = setTimeout(runIdleAttract, IDLE_MS)
}

function initIdleAttract() {
  const onActivity = () => {
    if (!idleRunning) resetIdleTimer()
  }
  ;['mousemove', 'pointerdown', 'mousedown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach(
    (ev) => window.addEventListener(ev, onActivity, { passive: true }),
  )
  resetIdleTimer()
}

// ── BOOT ─────────────────────────────────────────────────────────────────────

function boot() {
  initTheme()
  initCursor()
  initLightbox()
  initNavigation()
  initScrollRestore()
  initEnterFade()
  initIdleAttract()
  window.__setCursorMode?.('full')
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot)
} else {
  boot()
}
