// Home page: wave typography in the vorwort + autoplay of start-nav videos.
// Ported from pages/index.vue.

const vorwortText = `Ein Mann steht vor einer Tür. Der Türhüter lässt ihn nicht hindurch, verbietet es ihm aber auch nicht. Also wartet er ein Leben lang.
In Kafkas Türhüterparabel erkannte ich etwas Vertrautes. Auch ich sitze täglich vor einer Art Tür. Sie leuchtet in meiner Hand, reagiert auf jede Berührung und verspricht mir Zugang zu allem. Und trotzdem ertappe ich mich dabei, wie ich lese, ohne anzukommen – tippe, wische, scrolle und kann am Ende nicht sagen, was ich eigentlich gelesen habe.
Genau hier beginnt diese Arbeit: an der Schwelle zwischen Zugang und Distanz, zwischen Lesen und Verstehen.
`

const vorwortEl = document.querySelector('[data-vorwort]')
let lineDivs = []
let smoothY = -1
let targetY = -1
let rafId = null
let resizeTimer = null

function lerp(a, b, t) {
  return a + (b - a) * t
}

function buildLines() {
  const container = vorwortEl
  if (!container) return

  container.style.whiteSpace = 'normal'
  container.innerHTML = vorwortText
    .split(' ')
    .map((w) => `<span>${w} </span>`)
    .join('')

  const spans = Array.from(container.querySelectorAll('span'))
  const lineMap = new Map()
  spans.forEach((span) => {
    const top = Math.round(span.getBoundingClientRect().top)
    if (!lineMap.has(top)) lineMap.set(top, [])
    lineMap.get(top).push(span.textContent)
  })

  container.innerHTML = ''
  lineDivs = []
  Array.from(lineMap.values()).forEach((words) => {
    const div = document.createElement('div')
    div.textContent = words.join('').trimEnd()
    div.style.whiteSpace = 'nowrap'
    div.style.willChange = 'transform'
    container.appendChild(div)
    lineDivs.push(div)
  })

  const isDesktop = window.innerWidth > 1024 && window.matchMedia('(pointer: fine)').matches
  if (isDesktop) {
    applyWave()
  } else {
    lineDivs.forEach((div) => {
      div.style.transform = 'translateX(0)'
    })
  }
}

function applyWave() {
  const n = lineDivs.length
  if (n === 0) return
  const vw = window.innerWidth
  const A = vw * 0.25
  const phase = smoothY * (Math.PI / 2)

  lineDivs.forEach((div, i) => {
    const t = n > 1 ? i / (n - 1) : 0
    const x = A * Math.sin(Math.PI * t + phase)
    div.style.transform = `translateX(${Math.max(0, x)}px)`
  })
}

let idleFrames = 0

function onMouseMove(e) {
  targetY = (e.clientY / window.innerHeight - 0.5) * 2
  idleFrames = 0
  if (!rafId) tick()
}

function tick() {
  smoothY = lerp(smoothY, targetY, 0.08)
  applyWave()
  idleFrames++
  if (idleFrames < 120) {
    rafId = requestAnimationFrame(tick)
  } else {
    rafId = null
  }
}

// Rebuild lines only when the width actually changed — the wave amplitude and
// line breaks only depend on width, so vertical resizes (e.g. mobile URL bar)
// no longer trigger a costly DOM rebuild. This removes most resize jank.
let lastWidth = window.innerWidth

function debouncedBuildLines() {
  if (window.innerWidth === lastWidth) return
  lastWidth = window.innerWidth
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(buildLines, 150)
}

function init() {
  if (!vorwortEl) return
  buildLines()

  if (window.innerWidth > 1024 && window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    tick()
  }

  window.addEventListener('resize', debouncedBuildLines, { passive: true })

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // start-nav videos have a real src already; just play/pause.
          if (!entry.target.src && entry.target.dataset.src) {
            entry.target.src = entry.target.dataset.src
          }
          entry.target.play().catch(() => {})
        } else {
          entry.target.pause()
        }
      })
    },
    { rootMargin: '200px' },
  )
  document.querySelectorAll('.start-nav-cover video').forEach((v) => {
    videoObserver.observe(v)
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
