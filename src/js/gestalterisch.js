// Gestalterische Thesis: reine Medienseite. Kein Umbau des DOM wie auf den
// anderen Detailseiten – das Markup steht bereits fertig im HTML. Diese Datei
// übernimmt:
//   1. Hero-Video laden/abspielen, sobald es im Sichtfeld ist. Ton läuft nur,
//      solange das Video wirklich sichtbar ist.
//   2. Klick auf ein Medium öffnet die Lightbox aus app.js mit allen Medien der
//      Seite (Lesereihenfolge über data-gallery-index). Im Grossbildmodus läuft
//      der Ton dort, das Hintergrundvideo pausiert; nach dem Schliessen läuft es
//      normal weiter.
//   3. Hooks für den Idle-Modus aus app.js: Video mittig in den Viewport holen.

// Ab diesem sichtbaren Anteil gilt das Video als «im Sichtfeld» und bekommt Ton.
const SOUND_RATIO = 0.5
const IDLE_FLAG = 'idleToVideo'

let hero = null
let heroRatio = 0
let heroInView = false
let lightboxOpen = false
let soundArmed = false

// ── HERO-VIDEO ───────────────────────────────────────────────────────────────

function playHero(wantSound) {
  if (!hero) return
  if (!hero.src && hero.dataset.src) hero.src = hero.dataset.src
  hero.muted = !wantSound
  const played = hero.play()
  if (played && typeof played.catch === 'function') {
    played.catch(() => {
      if (hero.muted) return
      // Ton-Autoplay ohne vorherige Interaktion ist in den meisten Browsern
      // gesperrt. Also stumm weiterlaufen lassen und beim ersten Klick oder
      // Tastendruck nachträglich entstummen.
      hero.muted = true
      hero.play().catch(() => {})
      armSoundOnGesture()
    })
  }
}

function armSoundOnGesture() {
  if (soundArmed) return
  soundArmed = true
  const onGesture = () => {
    window.removeEventListener('pointerdown', onGesture)
    window.removeEventListener('keydown', onGesture)
    soundArmed = false
    if (heroInView && !lightboxOpen && heroRatio >= SOUND_RATIO) playHero(true)
  }
  window.addEventListener('pointerdown', onGesture)
  window.addEventListener('keydown', onGesture)
}

function initHero() {
  hero = document.querySelector('.gestalt-hero video')
  if (!hero) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        heroRatio = entry.intersectionRatio
        heroInView = entry.isIntersecting

        if (!heroInView) {
          hero.muted = true
          hero.pause()
          return
        }
        if (!hero.src && hero.dataset.src) hero.src = hero.dataset.src
        // Im Grossbildmodus läuft der Ton in der Lightbox – hier nichts tun.
        if (lightboxOpen) return
        playHero(heroRatio >= SOUND_RATIO)
      })
    },
    { threshold: [0, 0.25, SOUND_RATIO, 0.75, 1] },
  )
  observer.observe(hero)
}

// ── ZENTRIEREN (Hooks für den Idle-Modus in app.js) ──────────────────────────

// Zielposition, bei der das Video mittig im freien Bereich unter der Topbar
// steht. Ein 16:9-Video über die volle Inhaltsbreite ist fast immer etwas höher
// als dieser Bereich – dann wird bewusst nicht oben angeschlagen, sondern
// symmetrisch zentriert, sodass oben und unten gleich viel wegfällt.
function heroScrollTarget() {
  if (!hero) return null
  const rect = hero.getBoundingClientRect()
  const bar = document.querySelector('.topbar')?.getBoundingClientRect().height || 0
  const free = window.innerHeight - bar
  const offset = (free - rect.height) / 2
  return Math.max(0, rect.top + window.scrollY - bar - offset)
}

function centerHero() {
  const target = heroScrollTarget()
  if (target == null) return
  // behavior 'auto' überstimmt das globale scroll-behavior: smooth – der Sprung
  // passiert hinter der Blende und soll nicht zusätzlich sichtbar scrollen.
  window.scrollTo({ top: target, behavior: 'auto' })
}

function heroIsCentered() {
  const target = heroScrollTarget()
  if (target == null) return false
  return Math.abs(window.scrollY - target) < 24
}

// ── LIGHTBOX ─────────────────────────────────────────────────────────────────

function initLightbox() {
  const gallery = document.querySelector('.gestalt-gallery')
  if (!gallery) return

  gallery.addEventListener('click', (e) => {
    const target = e.target.closest('img[data-gallery-index], video[data-gallery-index]')
    if (!target) return

    const items = [...gallery.querySelectorAll('[data-gallery-index]')]
      .sort((a, b) => Number(a.dataset.galleryIndex) - Number(b.dataset.galleryIndex))
      .map((el) => ({
        type: el.tagName === 'VIDEO' ? 'video' : 'image',
        src: el.tagName === 'VIDEO' ? el.dataset.src || el.src : el.src,
        el,
      }))
      .filter((m) => m.src)

    const idx = items.findIndex((m) => m.el === target)
    window.__openLightbox?.(
      items.map(({ type, src }) => ({ type, src })),
      idx >= 0 ? idx : 0,
      { sound: true },
    )
  })

  window.addEventListener('lightbox:open', () => {
    lightboxOpen = true
    if (hero) {
      hero.pause()
      hero.muted = true
    }
  })

  window.addEventListener('lightbox:close', () => {
    lightboxOpen = false
    if (hero && heroInView) playHero(heroRatio >= SOUND_RATIO)
  })
}

// ── INIT ─────────────────────────────────────────────────────────────────────

function init() {
  initHero()
  initLightbox()

  window.__gestaltCenterVideo = centerHero
  window.__gestaltVideoCentered = heroIsCentered

  // Aus dem Idle-Modus einer anderen Seite hierher gewechselt: direkt beim
  // Video landen, noch bevor die Einblendung von app.js läuft.
  try {
    if (sessionStorage.getItem(IDLE_FLAG) === '1') {
      sessionStorage.removeItem(IDLE_FLAG)
      centerHero()
    }
  } catch (e) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
