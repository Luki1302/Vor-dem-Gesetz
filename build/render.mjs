// AST (@nuxt/content body) -> HTML string.
// Replicates ContentRenderer output plus the MediaImage/MediaVideo/Moodboard
// component templates 1:1, so the generated DOM is identical to what Nuxt
// produced at runtime (the page JS depends on exact tag/class structure).

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
])

function escapeText(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
}

function renderAttrs(props = {}) {
  const out = []
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined || value === null || value === false) continue
    let name = key
    let val = value
    if (key === 'className') {
      name = 'class'
      val = Array.isArray(value) ? value.join(' ') : value
    }
    if (val === true) {
      out.push(` ${name}`)
    } else {
      out.push(` ${name}="${escapeAttr(val)}"`)
    }
  }
  return out.join('')
}

// ── MDC component renderers (mirror the Vue component templates) ────────────

function mediaImageClass(size) {
  if (size === 'voll' || size === 'full') return 'w-full'
  if (size === 'xs') return 'img-xs'
  if (size === 'mini') return 'img-mini'
  if (size === 'klein') return 'img-klein'
  if (size === 'halb' || size === 'hoch') return 'w-1/2'
  return 'img-quer'
}

function renderMediaImage(props) {
  const src = props.src || ''
  const size = props.size || 'quer'
  const alt = props.alt || ''
  const caption = props.caption || ''
  const dark = props.dark || ''
  const figClass = size === 'quer' ? 'figure-quer' : ''
  const imgClass = mediaImageClass(size)
  // currentSrc starts as light src (SSR/initial); dark handled at runtime by JS.
  let img = `<img src="${escapeAttr(src)}"`
  if (dark) {
    img += ` data-dark="${escapeAttr(dark)}" data-light="${escapeAttr(src)}"`
  }
  img += ` alt="${escapeAttr(alt)}" class="${imgClass}" loading="lazy">`
  let html = `<figure class="${figClass}">${img}`
  if (caption) html += `<figcaption>${escapeText(caption)}</figcaption>`
  html += `</figure>`
  return html
}

function renderMediaVideo(props) {
  const src = props.src || ''
  const size = props.size || 'quer'
  const caption = props.caption || ''
  const vClass = size === 'quer' || size === 'voll' ? 'video-quer' : 'video-hoch'
  const video =
    `<video data-src="${escapeAttr(src)}" class="${vClass}" data-size="${escapeAttr(size)}" loop muted playsinline preload="none"></video>`
  if (caption) {
    return `<figure>${video}<figcaption>${escapeText(caption)}</figcaption></figure>`
  }
  return video
}

function renderMoodboard(props) {
  const items = props.items || []
  const isVideo = (s) => s.endsWith('.webm') || s.endsWith('.mp4')
  let inner = ''
  for (const src of items) {
    if (isVideo(src)) {
      inner += `<video data-src="${escapeAttr(src)}" loop muted playsinline preload="none" class="w-full h-auto"></video>`
    } else {
      inner += `<img src="${escapeAttr(src)}" alt="" loading="lazy" class="w-full h-auto">`
    }
  }
  return `<div class="moodboard" data-items="${escapeAttr(JSON.stringify(items))}">${inner}</div>`
}

// ── Generic AST node renderer ───────────────────────────────────────────────

export function renderNode(node) {
  if (node == null) return ''
  if (typeof node === 'string') return escapeText(node)

  const type = node.type
  const tag = node.tag

  if (type === 'text') return escapeText(node.value || '')
  if (type === 'comment') return ''

  // Root wrapper
  if (type === 'root' || (!tag && Array.isArray(node.children))) {
    return renderChildren(node.children)
  }

  // MDC components
  if (tag === 'media-image' || tag === 'MediaImage') return renderMediaImage(node.props || {})
  if (tag === 'media-video' || tag === 'MediaVideo') return renderMediaVideo(node.props || {})
  if (tag === 'moodboard' || tag === 'Moodboard') return renderMoodboard(node.props || {})

  if (!tag) return renderChildren(node.children)

  const attrs = renderAttrs(node.props)
  if (VOID_TAGS.has(tag)) {
    return `<${tag}${attrs}>`
  }
  return `<${tag}${attrs}>${renderChildren(node.children)}</${tag}>`
}

function renderChildren(children) {
  if (!children) return ''
  return children.map(renderNode).join('')
}

// Render a document body to HTML. The body's top node is usually the
// `<div class="content-page">` wrapper.
export function renderBody(doc) {
  const body = doc.body
  if (!body) return ''
  return renderChildren(body.children)
}
