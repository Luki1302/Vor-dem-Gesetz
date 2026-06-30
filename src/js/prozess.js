// Prozessdokumentation page: restructures the hidden raw content into the
// 3-column media / text / TOC layout with hover-linked sticky media.
// Ported from pages/gestalterisch/prozess.vue.

const months = [
  { slug: 'februar', label: 'Februar' },
  { slug: 'maerz', label: 'März' },
  { slug: 'april', label: 'April' },
  { slug: 'mai', label: 'Mai' },
  { slug: 'juni', label: 'Juni' },
]

let activeSlotId = null
const mediaMarkers = []
const slotStore = new Map()
let scrollRaf = null
let resizeTimer = null
let resizing = false
let mediaPoolEl = null

function getOrientation(el) {
  const cls = el.className || ''
  const fig = el.querySelector?.('figure')
  const vid = el.tagName === 'VIDEO' ? el : el.querySelector?.('video')
  const img = el.querySelector?.('img')
  if (
    fig?.className?.includes('figure-quer') ||
    vid?.className?.includes('video-quer') ||
    img?.classList?.contains('img-quer')
  )
    return 'landscape'
  const dataSize = vid?.dataset?.size || img?.dataset?.size || ''
  if (dataSize === 'xs') return 'xs'
  if (dataSize === 'mini') return 'mini'
  if (dataSize === 'klein') return 'small'
  if (dataSize === 'voll' || dataSize === 'full') return 'full'
  if (img?.classList?.contains('w-full')) return 'full'
  if (img?.classList?.contains('img-xs')) return 'xs'
  if (img?.classList?.contains('img-mini')) return 'mini'
  if (img?.classList?.contains('img-klein')) return 'small'
  if (vid?.className?.includes('video-hoch') || img?.classList?.contains('w-1/2')) return 'portrait'
  return 'landscape'
}

function showSlot(id) {
  if (activeSlotId === id) return
  if (activeSlotId) {
    const prev = mediaPoolEl?.firstChild
    if (prev) {
      prev.querySelectorAll('video').forEach((v) => {
        v.pause()
        v.removeAttribute('src')
      })
      prev.querySelectorAll('img').forEach((img) => {
        img.removeAttribute('src')
      })
      prev.remove()
    }
    document.querySelector(`.fig-ref[data-media-id="${activeSlotId}"]`)?.classList.remove('active')
  }
  activeSlotId = id
  if (!id) return
  const data = slotStore.get(id)
  if (!data || !mediaPoolEl) return

  const slot = document.createElement('div')
  slot.className = `detail-media-slot ${data.orient} active`
  slot.dataset.mediaId = id
  if (data.isBulk) slot.classList.add('bulk')
  if (data.isBulk && data.items.length === 3) {
    slot.classList.add(data.allLandscape || data.hasWrapper ? 'bulk-3' : 'bulk-3-split')
  }
  if (data.isBulk && data.items.length === 4) slot.classList.add('bulk-4')
  if (data.isBulk && data.items.length >= 7 && data.items.length <= 14 && data.items.length !== 12)
    slot.classList.add('bulk-4col')
  if (data.isBulk && data.items.length === 5) slot.classList.add('bulk-5')
  if (data.isBulk && data.items.length === 12) slot.classList.add('bulk-6col')
  if (data.isBulk && data.items.length > 30) slot.classList.add('bulk-7col')
  if (data.isBulk && data.items.length > 20 && data.items.length <= 30) slot.classList.add('bulk-5col')
  if (data.items.length === 2 && data.orient === 'landscape') slot.classList.add('paired')
  if (data.isUnequal) {
    slot.classList.add('unequal')
    const loaders2 = data.items.map((item) => loadRatio(item))
    Promise.all(loaders2).then(([r1, r2]) => {
      const w1 = (r1 / (r1 + 2 * r2)) * 100
      const w2 = ((2 * r2) / (r1 + 2 * r2)) * 100
      const children = slot.querySelectorAll(':scope > figure, :scope > video')
      if (children[0]) children[0].style.width = `calc(${w1}% - 0.2rem)`
      if (children[1]) children[1].style.width = `calc(${w2}% - 0.2rem)`
    })
  }
  if (data.isSplitWide && !data.isUnequal) {
    slot.classList.add('paired', 'split-wide')
    const loaders = data.items.map((item) => loadRatio(item))
    Promise.all(loaders).then(([r1, r2]) => {
      const w1 = (r1 / (r1 + r2)) * 100
      const w2 = (r2 / (r1 + r2)) * 100
      const children = slot.querySelectorAll(':scope > figure, :scope > video')
      if (children[0]) children[0].style.width = `calc(${w1}% - 0.2rem)`
      if (children[1]) children[1].style.width = `calc(${w2}% - 0.2rem)`
    })
  }

  const isSplit3 = slot.classList.contains('bulk-3-split')
  const isBulk3 = slot.classList.contains('bulk-3')
  let splitLeft = null
  let splitRow = null
  let bulk3Row = null
  if (isSplit3) {
    splitRow = document.createElement('div')
    splitRow.className = 'split-images-row'
    splitLeft = document.createElement('div')
    splitLeft.className = 'split-col-left'
    splitRow.appendChild(splitLeft)
  }
  if (isBulk3) {
    bulk3Row = document.createElement('div')
    bulk3Row.className = data.isBulk3_2x1 ? 'bulk-3-2x1' : data.hasWrapper ? 'bulk-3-flex' : 'bulk-3-row'
  }

  data.items.forEach((item, idx) => {
    let el
    if (item.type === 'img') {
      const fig = document.createElement('figure')
      const img = document.createElement('img')
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
      img.src = isDark && item.darkSrc ? item.darkSrc : item.src
      if (item.darkSrc) {
        img.dataset.dark = item.darkSrc
        img.dataset.light = item.lightSrc || item.src
      }
      fig.appendChild(img)
      el = fig
    } else if (item.type === 'video') {
      const v = document.createElement('video')
      v.src = item.src
      v.loop = true
      v.muted = true
      v.playsInline = true
      v.play().catch(() => {})
      el = v
    } else if (item.type === 'html') {
      const wrap = document.createElement('div')
      wrap.innerHTML = item.html
      el = wrap.firstChild || wrap
    }

    if (!isBulk3 && !isSplit3 && !slot.classList.contains('bulk-5') && el) {
      const widthMap = {
        landscape: '100%',
        full: '85%',
        portrait: '75%',
        small: '60%',
        mini: '50%',
        xs: '40%',
      }
      const itemOrient = data.items[idx]?.orient || data.orient
      const w = widthMap[itemOrient] || widthMap[data.orient] || '100%'
      if (el.tagName === 'FIGURE') {
        el.style.maxWidth = w
        el.querySelector('img').style.width = '100%'
      } else el.style.maxWidth = w
    }

    if (isSplit3 && idx < 2) {
      splitLeft.appendChild(el)
    } else if (isSplit3) {
      splitRow.appendChild(el)
    } else if (isBulk3) {
      bulk3Row.appendChild(el)
    } else {
      slot.appendChild(el)
    }
  })

  if (isSplit3) slot.appendChild(splitRow)
  if (isBulk3) slot.appendChild(bulk3Row)

  if (isBulk3 && !data.allLandscape) {
    const loaders = data.items.map((item) => loadRatio(item))
    Promise.all(loaders).then((ratios) => {
      const total = ratios.reduce((a, b) => a + b, 0)
      const children = bulk3Row.querySelectorAll(':scope > figure, :scope > video')
      ratios.forEach((r, i) => {
        if (children[i]) children[i].style.width = `calc(${(r / total) * 100}% - 0.27rem)`
      })
    })
  }

  const cap = document.createElement('div')
  cap.className = 'media-caption'
  const numSpan = document.createElement('span')
  numSpan.className = 'media-caption-num'
  numSpan.textContent = `[${data.num}]`
  cap.appendChild(numSpan)
  const textSpan = document.createElement('span')
  textSpan.className = 'media-caption-text'
  textSpan.innerHTML = data.caption || ''
  cap.appendChild(textSpan)
  slot.appendChild(cap)

  mediaPoolEl.appendChild(slot)
  document.querySelector(`.fig-ref[data-media-id="${id}"]`)?.classList.add('active')
}

function loadRatio(item) {
  if (item.type === 'video') {
    return new Promise((resolve) => {
      const v = document.createElement('video')
      v.src = item.src
      v.addEventListener('loadedmetadata', () => resolve(v.videoWidth / v.videoHeight))
      v.addEventListener('error', () => resolve(1))
    })
  }
  const img = new Image()
  img.src = item.src
  return img
    .decode()
    .then(() => img.naturalWidth / img.naturalHeight)
    .catch(() => 1)
}

function isMediaElement(el) {
  const tag = el.tagName
  if (tag === 'FIGURE' || tag === 'VIDEO') return true
  const cls = el.className || ''
  if (
    cls.includes('moodboard') ||
    cls.includes('media-') ||
    cls.includes('img-duo') ||
    cls.includes('img-trio')
  )
    return true
  if (tag === 'DIV' && el.querySelector('figure, video')) return true
  return false
}

function restructureContent() {
  const renderers = document.querySelectorAll('.pz-raw-content .content-page')
  if (!renderers.length) return

  mediaPoolEl = document.querySelector('.detail-media-area')
  const textCol = document.querySelector('.detail-text-col')
  if (!mediaPoolEl || !textCol) return

  let mediaCount = 0
  const pairs = []
  let rendererIdx = 0

  renderers.forEach((content) => {
    const monthSlug = months[rendererIdx]?.slug || ''
    const monthLabel = months[rendererIdx]?.label || ''
    let h2Count = 0
    rendererIdx++

    const monthHeading = document.createElement('h2')
    monthHeading.textContent = `${rendererIdx}. ${monthLabel}`
    monthHeading.id = `month-${monthSlug}`
    textCol.appendChild(monthHeading)

    content.querySelectorAll(':scope > section').forEach((section) => {
      const children = [...section.children]
      let lastTextEl = null
      let pendingMedia = []

      function flushMedia(captionAside) {
        if (!pendingMedia.length) return

        mediaCount++
        const mediaId = `dp-${mediaCount}`

        const hasWrapper = pendingMedia.some((el) => {
          const cls = el.className || ''
          return (
            cls.includes('media-gallery') ||
            cls.includes('media-trio') ||
            cls.includes('media-duo') ||
            cls.includes('media-2x1') ||
            cls.includes('media-unequal')
          )
        })
        const is2x1 = pendingMedia.some((el) => (el.className || '').includes('media-2x1'))
        const isUnequal = pendingMedia.some((el) => (el.className || '').includes('media-unequal'))
        const isBulk = hasWrapper || pendingMedia.length > 3
        const orient = isBulk ? 'bulk' : getOrientation(pendingMedia[0])
        const o1 = getOrientation(pendingMedia[0])
        const o2 = pendingMedia.length > 1 ? getOrientation(pendingMedia[1]) : o1
        const isSplitWide =
          pendingMedia.length === 2 &&
          !isBulk &&
          ((o1 === 'landscape' && o2 === 'portrait') || (o1 === 'portrait' && o2 === 'landscape'))

        const items = []
        pendingMedia.forEach((el) => {
          const cls = el.className || ''
          if (
            cls.includes('media-gallery') ||
            cls.includes('media-trio') ||
            cls.includes('media-duo') ||
            cls.includes('media-2x1') ||
            cls.includes('media-unequal')
          ) {
            el.querySelectorAll('img, video').forEach((child) => {
              if (child.tagName === 'VIDEO') {
                items.push({ type: 'video', src: child.src || child.dataset.src || '' })
              } else {
                items.push({ type: 'img', src: child.src || child.dataset.src || '' })
              }
            })
          } else {
            const vid = el.tagName === 'VIDEO' ? el : el.querySelector('video')
            const img = el.querySelector('img')
            const itemOrient = getOrientation(el)
            if (vid)
              items.push({ type: 'video', src: vid.src || vid.dataset.src || '', orient: itemOrient })
            else if (img)
              items.push({
                type: 'img',
                src: img.src || img.dataset.src || '',
                orient: itemOrient,
                darkSrc: img.dataset.dark || '',
                lightSrc: img.dataset.light || '',
              })
            else items.push({ type: 'html', html: el.outerHTML, orient: itemOrient })
          }
        })

        const allLandscape = pendingMedia.every((el) => getOrientation(el) === 'landscape')

        slotStore.set(mediaId, {
          items,
          caption: captionAside ? captionAside.innerHTML.trim() : null,
          isBulk,
          isSplitWide,
          allLandscape,
          hasWrapper,
          isBulk3_2x1: is2x1 && items.length === 3,
          isUnequal,
          orient,
          num: mediaCount,
        })

        const marker = document.createElement('span')
        marker.className = 'fig-ref'
        marker.dataset.mediaId = mediaId
        marker.textContent = `[${mediaCount}]`
        marker.addEventListener('mouseenter', () => showSlot(mediaId))
        marker.addEventListener('click', (e) => {
          e.preventDefault()
          showSlot(mediaId)
        })

        const parentEl = lastTextEl && lastTextEl.parentNode === textCol ? lastTextEl : textCol
        const existingRefs = parentEl.querySelectorAll(':scope > .fig-ref').length
        if (existingRefs > 0) {
          marker.style.top = `calc(var(--font-text-size) * 0.35 + ${existingRefs} * var(--font-konsult-size) * var(--font-text-lh))`
        }
        parentEl.appendChild(marker)

        pairs.push({ marker, slotId: mediaId })
        pendingMedia = []
      }

      children.forEach((child) => {
        if (child.tagName === 'H1') return

        if (child.tagName === 'H2') {
          child.textContent = `${rendererIdx}.${h2Count + 1} ${child.textContent}`
          child.dataset.month = monthSlug
          child.dataset.sectionIndex = h2Count
          child.id = `toc-${monthSlug}-${h2Count}`
          h2Count++
        }

        if (isMediaElement(child)) {
          pendingMedia.push(child)
        } else if (child.tagName === 'ASIDE' && pendingMedia.length > 0) {
          flushMedia(child)
        } else {
          flushMedia(null)
          textCol.appendChild(child)
          lastTextEl = child
        }
      })

      flushMedia(null)
    })
  })

  mediaMarkers.push(...pairs)

  window.addEventListener(
    'scroll',
    () => {
      if (scrollRaf || resizing) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null
        if (!pairs.length || resizing) return
        const vh = window.innerHeight
        let best = -1
        let bestDist = Infinity
        pairs.forEach((p, i) => {
          const rect = p.marker.getBoundingClientRect()
          if (rect.top >= 0 && rect.top <= vh) {
            const dist = Math.abs(rect.top - vh * 0.4)
            if (dist < bestDist) {
              bestDist = dist
              best = i
            }
          }
        })
        if (best >= 0) showSlot(pairs[best].slotId)
        else showSlot(null)
        updateTocActive()
      })
    },
    { passive: true },
  )

  if (pairs.length) showSlot(pairs[0].slotId)
  updateTocActive()

  document.querySelector('.pz-raw-content')?.remove()
}

function updateTocActive() {
  const tocLinks = document.querySelectorAll('.toc-nav a[data-toc-id]')
  const sections = [...document.querySelectorAll('[id^="toc-"], [id^="month-"]')]
  let activeId = sections[0]?.id
  const threshold = window.innerHeight * 0.3
  for (const s of sections) {
    if (s.getBoundingClientRect().top <= threshold) activeId = s.id
  }
  tocLinks.forEach((a) => {
    a.classList.toggle('active', a.dataset.tocId === activeId)
  })
}

function scrollToSection(slug, index) {
  const el = document.getElementById(`toc-${slug}-${index}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToMonth(slug) {
  const el = document.getElementById(`month-${slug}`)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function initToc() {
  document.querySelectorAll('[data-scroll-month]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      scrollToMonth(a.dataset.scrollMonth)
    })
  })
  document.querySelectorAll('[data-scroll-section]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault()
      const [slug, index] = a.dataset.scrollSection.split(':')
      scrollToSection(slug, parseInt(index, 10))
    })
  })
}

function init() {
  document.documentElement.scrollTop // noop touch
  requestAnimationFrame(() => {
    restructureContent()
    initToc()
  })

  const themeObserver = new MutationObserver(() => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark'
    document.querySelectorAll('.detail-media-area img[data-dark]').forEach((img) => {
      img.src = isDark ? img.dataset.dark : img.dataset.light
    })
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  })

  // Resize: pause the scroll-driven slot switching while resizing, and
  // suspend per-paragraph hyphenation during width changes (see kultur JS).
  let lastWidth = window.innerWidth
  window.addEventListener(
    'resize',
    () => {
      resizing = true
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth
        document.documentElement.classList.add('detail-resizing')
      }
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        resizing = false
        document.documentElement.classList.remove('detail-resizing')
      }, 200)
    },
    { passive: true },
  )
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init)
} else {
  init()
}
