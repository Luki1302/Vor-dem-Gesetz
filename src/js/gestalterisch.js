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
//
// ZUM TON: Kein Browser lässt eine frisch geladene Seite von sich aus mit Ton
// starten – weder nach einem Reload noch nach dem Rücksprung aus dem Leerlauf,
// denn beides ist ein neues Dokument ohne Nutzer-Interaktion. Das Video startet
// deshalb stumm, und diese Datei holt den Ton so früh nach, wie es der Browser
// zulässt:
//   • bei der ersten echten Eingabe (Klick, Tastendruck, Touch) sofort,
//   • ohne Eingabe über einen stillen Testton, der im Hintergrund regelmässig
//     prüft, ob Ton inzwischen erlaubt ist (Safari-Einstellung, Wiederkehr aus
//     dem Hintergrund, gelockerte Richtlinie) – und dann nachzieht.
// Für den Dauerbetrieb (Ausstellung, Kiosk) muss die Freigabe einmal im Browser
// gesetzt werden. Safari: Menü «Safari» → «Einstellungen für diese Website …» →
// «Automatische Wiedergabe» → «Alle automatischen Wiedergaben erlauben».
// Danach läuft der Ton auch direkt nach Reload und Leerlauf-Rücksprung.

// Ab diesem sichtbaren Anteil gilt das Video als «im Sichtfeld» und bekommt Ton.
const SOUND_RATIO = 0.5
const IDLE_FLAG = 'idleToVideo'

// 0,0125 s Stille (8 kHz, mono) als Data-URI. Damit lässt sich prüfen, ob der
// Browser Ton gerade erlaubt, ohne das Hero-Video anzufassen: ein abgelehnter
// Versuch würde es dort still pausieren und als Stocken sichtbar werden.
const SILENCE_WAV =
  'data:audio/wav;base64,UklGRogAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWQAAACAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA'

// Abstände der Hintergrundprüfung: schnell anfangen, dann zurückfahren, damit
// eine dauerhaft gesperrte Seite nicht endlos im Sekundentakt anklopft.
const PROBE_MIN_MS = 800
const PROBE_MAX_MS = 8000
// Frist, nach der ein Entstummen als gelungen gilt. Safari lehnt nicht immer
// über die Promise ab, sondern pausiert das Video still.
const CONFIRM_MS = 400

// Ereignisse, die dem Browser als Freigabe gelten. Bewusst das Loslassen bzw.
// den Klick und nicht pointerdown: sonst wäre auf dem Weg in die Lightbox kurz
// der Ton des Hero-Videos zu hören.
const ACTIVATION_EVENTS = [
  'click',
  'dblclick',
  'pointerup',
  'mouseup',
  'touchend',
  'keydown',
  'keyup',
]

let hero = null
let heroRatio = 0
let heroInView = false
let lightboxOpen = false
// true, solange das Video laufen SOLL. Damit lässt sich ein Pause-Ereignis, das
// wir selbst ausgelöst haben, von einem unterscheiden, das der Browser
// erzwungen hat.
let wantPlaying = false

// ── TON-FREIGABE ─────────────────────────────────────────────────────────────

let probeEl = null
let probeTimer = null
let probeDelay = PROBE_MIN_MS
let confirmTimer = null
// true, sobald das Video nachweislich mit Ton lief. Der Browser hat die Sperre
// für dieses Element dann dauerhaft aufgehoben – ab hier darf ohne Umweg über
// den Testton entstummt werden.
let soundUnlocked = false
// true, sobald einmal versucht wurde, die Freigabe ausserhalb des Sichtfelds
// mitzunehmen. Der Versuch lohnt nur ein Mal pro Seitenaufruf.
let warmedUp = false

// Soll das Video gerade mit Ton laufen?
function shouldHaveSound() {
  return heroInView && !lightboxOpen && heroRatio >= SOUND_RATIO
}

function soundIsOn() {
  return !!hero && !hero.muted && !hero.paused
}

// Spielt die stille Testdatei unstumm an. Gelingt das, erlaubt der Browser
// gerade Ton. Hörbar ist dabei nichts, und bei Erfolg wird sofort angehalten.
function soundPermitted() {
  if (!probeEl) {
    probeEl = document.createElement('audio')
    probeEl.src = SILENCE_WAV
    probeEl.loop = true
    probeEl.preload = 'auto'
  }
  let played
  try {
    played = probeEl.play()
  } catch (e) {
    return Promise.resolve(false)
  }
  if (!played || typeof played.then !== 'function') return Promise.resolve(!probeEl.paused)
  return played.then(
    () => {
      probeEl.pause()
      return true
    },
    () => false,
  )
}

function stopProbe() {
  clearTimeout(probeTimer)
  probeTimer = null
}

function scheduleProbe(delay) {
  if (!hero || probeTimer) return
  probeTimer = setTimeout(() => {
    probeTimer = null
    probeNow()
  }, delay == null ? probeDelay : delay)
}

// Nach jedem Ereignis, das die Lage geändert haben kann (Tab wieder sichtbar,
// Video neu geladen): Wartezeit zurücksetzen und bald wieder prüfen.
function restartProbe() {
  probeDelay = PROBE_MIN_MS
  stopProbe()
  scheduleProbe(PROBE_MIN_MS)
}

function probeNow() {
  if (!hero || !shouldHaveSound() || !hero.muted) return
  soundPermitted().then((ok) => {
    if (!ok) {
      probeDelay = Math.min(probeDelay * 2, PROBE_MAX_MS)
      scheduleProbe()
      return
    }
    if (hero.muted && shouldHaveSound()) playWithSound(true)
  })
}

// ── HERO-VIDEO ───────────────────────────────────────────────────────────────

function ensureSrc() {
  if (hero && !hero.src && hero.dataset.src) hero.src = hero.dataset.src
}

// Rückfallebene: lieber stumm weiterlaufen als gar nicht – und im Hintergrund
// weiter auf die Freigabe warten.
function playMuted() {
  if (!hero) return
  ensureSrc()
  wantPlaying = true
  hero.muted = true
  const played = hero.play()
  if (played && typeof played.catch === 'function') played.catch(() => {})
  scheduleProbe()
}

function pauseHero() {
  if (!hero) return
  wantPlaying = false
  stopProbe()
  hero.pause()
}

// Mit Ton starten. Muss synchron aus einem Nutzer-Ereignis heraus aufrufbar
// bleiben – deshalb steht hier bewusst kein Timeout und kein await davor.
function playWithSound(afterProbe) {
  if (!hero) return
  ensureSrc()
  wantPlaying = true
  hero.muted = false
  const played = hero.play()
  if (played && typeof played.catch === 'function') {
    played.catch((err) => {
      playMuted()
      // Nur eine verweigerte Freigabe rechtfertigt längeres Warten. Andere
      // Fehler – etwa ein vom Laden unterbrochener Start – sind vorübergehend.
      if (!err || err.name !== 'NotAllowedError') restartProbe()
    })
  }
  confirmSound(afterProbe)
}

// Kurz nachfassen: läuft das Video nicht hörbar, zurück auf stumm.
function confirmSound(afterProbe) {
  clearTimeout(confirmTimer)
  confirmTimer = setTimeout(() => {
    if (!hero || !shouldHaveSound()) return
    if (soundIsOn()) {
      soundUnlocked = true
      stopProbe()
      return
    }
    playMuted()
    // Der Testton meldet Freigabe, das Video bleibt trotzdem stumm: dann hilft
    // nur noch eine echte Eingabe. Weiterprüfen würde das Bild im Takt der
    // Prüfung stocken lassen. Eine Eingabe oder die Rückkehr aus dem
    // Hintergrund setzt die Prüfung über restartProbe() wieder in Gang.
    if (afterProbe) stopProbe()
  }, CONFIRM_MS)
}

// Ton anfordern. Läuft das Video bereits stumm und liegt weder ein
// Nutzer-Ereignis noch eine frühere Freigabe vor, erst über den Testton prüfen –
// ein abgelehnter Versuch am laufenden Video wäre als Stocken sichtbar.
function requestSound(fromGesture) {
  if (!hero || !shouldHaveSound()) return
  if (fromGesture || soundUnlocked || hero.paused) playWithSound()
  else probeNow()
}

// Jede echte Eingabe gilt dem Browser als Freigabe. Die Listener bleiben liegen,
// damit das nach Idle-Wechsel, Lightbox oder Reload wieder greift.
function onActivation() {
  if (!hero) return
  if (shouldHaveSound()) {
    if (!soundIsOn()) requestSound(true)
    return
  }
  // Video gerade nicht im Sichtfeld (oder Lightbox offen): die Freigabe
  // trotzdem einmal mitnehmen, damit der Ton später ohne weiteren Klick läuft.
  // play() und pause() im selben Schritt bleiben lautlos; nur anfassen, wenn
  // das Video ohnehin steht.
  if (warmedUp || !hero.src || !hero.paused) return
  warmedUp = true
  // volume 0 statt muted: stumm zählt dem Browser nicht als Ton-Wiedergabe und
  // brächte die Freigabe damit nicht ein – hörbar ist trotzdem nichts.
  hero.volume = 0
  hero.muted = false
  const played = hero.play()
  if (played && typeof played.catch === 'function') played.catch(() => {})
  hero.pause()
  hero.muted = true
  hero.volume = 1
}

function initSoundRecovery() {
  // Capture-Phase: läuft vor dem Klick-Handler der Galerie, sonst wäre die
  // Lightbox schon offen und der Moment der Freigabe verpasst.
  ACTIVATION_EVENTS.forEach((ev) =>
    window.addEventListener(ev, onActivation, { capture: true, passive: true }),
  )

  // Zurück aus dem Hintergrund (Bildschirm aus, Tabwechsel, Kiosk-Neustart):
  // Der Browser hat das Video dort pausiert – neu anfordern.
  const onBack = () => {
    if (document.visibilityState !== 'visible') return
    probeDelay = PROBE_MIN_MS
    requestSound(false)
  }
  document.addEventListener('visibilitychange', onBack)
  window.addEventListener('focus', onBack)
  // Rückkehr über den Verlauf (bfcache): Zustand nicht als gegeben nehmen.
  window.addEventListener('pageshow', onBack)
}

function initHero() {
  hero = document.querySelector('.gestalt-hero video')
  if (!hero) return

  // Der Browser kann ein laufendes Video still pausieren, wenn es ohne Freigabe
  // entstummt wird – die play()-Promise meldet das nicht. Nur auf Pausen
  // reagieren, die wir nicht selbst ausgelöst haben.
  hero.addEventListener('pause', () => {
    if (wantPlaying && !hero.muted && shouldHaveSound()) playMuted()
  })

  // Der erste play()-Versuch läuft, bevor Daten da sind. Sobald welche
  // ankommen, erneut prüfen, ob Ton inzwischen erlaubt ist.
  hero.addEventListener('loadeddata', () => {
    if (hero.muted && shouldHaveSound()) restartProbe()
  })

  hero.addEventListener('playing', () => {
    if (soundIsOn()) {
      soundUnlocked = true
      stopProbe()
    } else if (shouldHaveSound()) {
      scheduleProbe()
    }
  })

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        heroRatio = entry.intersectionRatio
        heroInView = entry.isIntersecting

        if (!heroInView) {
          hero.muted = true
          pauseHero()
          return
        }
        ensureSrc()
        // Im Grossbildmodus läuft der Ton in der Lightbox – hier nichts tun.
        if (lightboxOpen) return
        if (heroRatio >= SOUND_RATIO) requestSound(false)
        else playMuted()
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
  // Der Rücksprung aus dem Leerlauf hat keine Eingabe hinter sich: hier beginnt
  // die Hintergrundprüfung von vorn, damit der Ton so früh wie möglich kommt.
  restartProbe()
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
      pauseHero()
      hero.muted = true
    }
  })

  window.addEventListener('lightbox:close', () => {
    lightboxOpen = false
    if (!hero || !heroInView) return
    // Geschlossen wird fast immer per Klick oder Escape – dieser Aufruf läuft
    // also noch im Nutzer-Ereignis und darf den Ton direkt anfordern.
    if (heroRatio >= SOUND_RATIO) playWithSound()
    else playMuted()
  })
}

// ── INIT ─────────────────────────────────────────────────────────────────────

function init() {
  initHero()
  initLightbox()
  initSoundRecovery()

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
