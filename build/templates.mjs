// Static HTML shells for each page. Markup is ported verbatim from the Vue
// components/layouts/pages so the rendered DOM is identical. Vue-specific
// constructs are replaced by their resolved static equivalents:
//   <NuxtLink to="x">       -> <a href="x" data-link>
//   <ThemeToggle/>          -> static button markup (state set by theme.js)
//   <ImageLightbox/>        -> empty overlay container (managed by lightbox.js)
//   <AppCursor/>            -> custom cursor markup
//   pageTransition fade     -> handled by app.js on link navigation

import { renderBody } from './render.mjs'

const THEME_INIT = `<script>(function(){try{var m=localStorage.getItem('theme');if(!m){m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.setAttribute('data-theme',m);}catch(e){document.documentElement.setAttribute('data-theme','light');}document.documentElement.setAttribute('lang','de');})();</script>`

const THEME_TOGGLE = `<button class="theme-toggle" title="Farbmodus" data-theme-toggle><span data-theme-light>○</span><span data-theme-dark>●</span></button>`

const CURSOR = `<div class="custom-cursor full" data-cursor><span class="cursor-line cursor-top"></span><span class="cursor-line cursor-right"></span><span class="cursor-line cursor-bottom"></span><span class="cursor-line cursor-left"></span></div>`

const LIGHTBOX = `<div data-lightbox-root></div>`

function htmlShell({ title, bodyClass = '', content, scripts = [] }) {
  const scriptTags = scripts
    .map((s) => `<script type="module" src="${s}"></script>`)
    .join('')
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="stylesheet" href="/styles.css">
${THEME_INIT}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<div class="desktop-content">
${content}
${LIGHTBOX}
${CURSOR}
</div>
<div class="mobile-notice">
<p>«Vor dem Gesetz» ist nur für die Desktop-Ansicht geeignet.</p>
</div>
${scriptTags}
</body>
</html>`
}

// ── HOME / INDEX ────────────────────────────────────────────────────────────

function homeContent() {
  return `<div class="start-wrap">
<section class="start-hero">
<h1 class="start-title"><span>Vor dem</span><span>Gesetz</span></h1>
</section>
<section class="start-subtitle-row">
<div class="start-intro-right">
<p class="start-subtitle">Interaktive Typografie<br>zwischen Kontrolle und Kontrollverlust</p>
<p class="start-subtitle" style="text-indent: 4vw">Lukas Hecht</p>
</div>
</section>
<section class="start-vorwort-section" style="overflow: hidden">
<div data-vorwort class="start-vorwort"></div>
</section>
<div class="start-grid">
<div class="start-mode-toggle">
<div class="mode-toggle">${THEME_TOGGLE}</div>
</div>
<div class="start-block">
<h3 class="start-block-label">Thema und Fragestellung</h3>
<p>Lesen ist nicht nur ein kognitiver Prozess, sondern eine körperliche Interaktion zwischen lesender Person, Text und Interface. Augenbewegung, Aufmerksamkeit und Handlungsmöglichkeiten bestimmen dabei, wie ein Text im Moment des Lesens erfasst werden kann. Die Arbeit untersucht, wie sich diese Interaktion zwischen Körper und Text im digitalen Lesen verändert und wie Bewegung, Reaktion und Unterbrechung den Zugang zum Text strukturieren.</p>
</div>
<div class="start-block">
<h3 class="start-block-label">Relevanz des Themas</h3>
<p>Das Smartphone ist heute eines der wichtigsten Lesemedien. Während digitale Texte jederzeit verfügbar sind, konkurrieren sie permanent mit Benachrichtigungen, Algorithmen und anderen Formen der Aufmerksamkeitslenkung. Lesen wird dadurch zunehmend zu einem gesteuerten Prozess, in dem Interfaces beeinflussen, was sichtbar ist und wie Inhalte wahrgenommen werden.</p>
</div>
<div class="start-block">
<h3 class="start-block-label">Motivation</h3>
<p>Mich interessiert die Diskrepanz zwischen gefühlter Kontrolle und tatsächlicher Steuerung beim digitalen Lesen. Digitale Interfaces vermitteln den Eindruck, jederzeit Zugang zu Informationen zu haben, während sie gleichzeitig Aufmerksamkeit lenken und Handlungsmöglichkeiten vorgeben.</p>
</div>
<div class="start-block">
<h3 class="start-block-label">Zielsetzung</h3>
<p>Ziel der Arbeit ist es, die Bedingungen des Lesens im digitalen Raum zu untersuchen und die Rolle von Bewegung, Interaktion und Kontrolle im Leseprozess erfahrbar zu machen. Was die kulturgeschichtliche Thesis theoretisch herleitet, soll in der Installation körperlich als Erfahrung spürbar sein, die über das Lesen eines Textes hinausgeht.</p>
</div>
<a href="/gestalterisch" data-link class="start-nav" data-cursor-right>
<div class="start-nav-cover">
<video src="/assets/start/start-1.mp4" muted loop playsinline preload="none"></video>
</div>
<div class="start-nav-info">
<h3 class="start-block-label">Gestalterische Thesis</h3>
<p>Die Installation «Vor dem Gesetz» übersetzt Kafkas Erzählung in eine digitale Leseerfahrung. Die besuchende Person betritt einen Eingang und wird selbst zur Figur der Parabel. Sie steht vor einer Tür, die ihre Gestalt verändert. Anweisungen erscheinen darauf und verleihen dem Türhüter eine Stimme. Auf dem Smartphone in ihrer Hand entzieht sich der Text und wird erst durch Interaktion lesbar. Jede Geste löst eine Reaktion im Raum aus, doch der Zugang bleibt begrenzt.</p>
</div>
</a>
<a href="/gestalterisch/prozess" data-link class="start-nav" data-cursor-right>
<div class="start-nav-cover">
<video src="/assets/start/start-2.mp4" muted loop playsinline preload="none"></video>
</div>
<div class="start-nav-info">
<h3 class="start-block-label">Prozessdokumentation</h3>
<p>Die Dokumentation begleitet den gestalterischen Prozess Monat für Monat, von den ersten Experimenten im Februar bis zur fertigen Installation im Juni. Festgehalten werden auch Recherchen sowie die Überlegungen, die zu den jeweiligen Entscheidungen führten. Da die Dokumentation während des Prozesses immer wieder ergänzt wurde, erzählt sie nicht nur, was entstanden ist, sondern auch, warum es so und nicht anders kam.</p>
</div>
</a>
<a href="/kulturgeschichtlich" data-link class="start-nav" data-cursor-right>
<div class="start-nav-cover">
<video src="/assets/start/start-3.mp4" muted loop playsinline preload="none"></video>
</div>
<div class="start-nav-info">
<h3 class="start-block-label">Kulturgeschichtliche Thesis</h3>
<p>Ausgangspunkt ist die Veränderung des Lesens im Übergang vom analogen zum digitalen Raum. Die Arbeit untersucht, wie kognitive Prozesse des Lesens – Fixationen, Regressionen, Aufmerksamkeit und Gedächtnis – mit gestalterischen Eingriffen interagieren und welche Rolle dabei Bewegung, Interaktion und Kontrolle spielen. Perspektiven aus der Leseforschung und der aktuellen Gestaltungspraxis werden miteinander verknüpft.</p>
</div>
</a>
<footer class="start-impressum">
<strong>Bachelor Thesis 2026</strong>
<strong>Konzept und Gestaltung</strong>
<a href="https://lukashecht.ch/" target="_blank">Lukas Hecht<br></a>
<strong>Mentorierende</strong>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/marianna-helen-meyer" target="_blank">Marianna Helen Meyer</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/jinsu-ahn" target="_blank">Jinsu Ahn</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/invar-torre-hollaus" target="_blank">Dr. Invar-Torre Hollaus</a><br>
<strong>Danke auch an</strong>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/marion-fink" target="_blank">Prof. Marion Fink<br></a>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/philipp-stamm" target="_blank">Dr. Philipp Stamm<br></a>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/paloma-lopez-grueninger" target="_blank">Dr. Paloma López Grüninger<br></a>
<a href="https://teddavis.org/" target="_blank">Ted Davis<br></a>
<a href="https://braintrain.de/" target="_blank">Gabriele Forster<br></a>
<a href="https://martingolombek.net/de" target="_blank">Martin Golombek<br></a>
<a href="https://www.katharinakemmerling.com/" target="_blank">Katharina Kemmerling<br></a>
<strong>Schriften</strong>
ABC Daily Slab Variable Edu<br>
ABC Diatype Mono Variable Edu<br><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns" target="_blank"> FHNW, Hochschule für Gestaltung und Kunst Basel</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/institute/digitale-kommunikations-umgebungen" target="_blank"> Institut Digitale Kommunikationsumgebungen</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/studium/angebot/studiengaenge/visuelle-kommunikation-und-digitale-raume-ba" target="_blank">Bachelor Visuelle Kommunikation und digitale Räume</a><br>
Vertiefung: digitale Räume<br><br>
© 2026 Lukas Hecht / FHNW HGK Basel.<br>Alle Rechte vorbehalten.
</footer>
</div>
</div>`
}

export function homePage() {
  return htmlShell({
    title: 'Vor dem Gesetz',
    content: homeContent(),
    scripts: ['/js/app.js', '/js/index.js'],
  })
}

// ── DETAIL LAYOUT (topbar) ──────────────────────────────────────────────────

function topbar(pageTitle) {
  return `<header class="topbar">
<a href="/" data-link class="topbar-back" title="Zurück" data-cursor-left data-back><span class="back-diamond"></span></a>
<span class="topbar-page-title">${pageTitle}</span>
<div class="topbar-right">
<div class="mode-toggle">${THEME_TOGGLE}</div>
</div>
</header>`
}

// ── PROZESS PAGE ────────────────────────────────────────────────────────────

function extractText(node) {
  if (!node) return ''
  if (node.type === 'text') return node.value || ''
  if (node.children) return node.children.map(extractText).join('')
  return ''
}

function extractH2s(node) {
  if (!node) return []
  if (node.tag === 'h2') return [extractText(node)]
  if (node.children) return node.children.flatMap(extractH2s)
  return []
}

export function prozessPage(months) {
  // months: [{ slug, label, doc }]
  const tocItems = months
    .map((m, mi) => {
      const h2s = extractH2s(m.doc.body)
      const sub = h2s
        .map(
          (item, i) =>
            `<li class="toc-h2"><a href="#" data-toc-id="toc-${m.slug}-${i}" data-scroll-section="${m.slug}:${i}">${mi + 1}.${i + 1} ${item}</a></li>`,
        )
        .join('')
      return `<li class="toc-h1"><a href="#" data-toc-id="month-${m.slug}" data-scroll-month="${m.slug}">${mi + 1}. ${m.label}</a></li>${sub}`
    })
    .join('')

  const rawContent = months
    .map((m) => renderBody(m.doc))
    .join('')

  const content = `${topbar('Prozessdokumentation')}
<div>
<div class="detail-header">
<div class="detail-intro-meta">
<p><strong>Mentorierende</strong><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/marianna-helen-meyer" target="_blank">Marianna Helen Meyer</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/jinsu-ahn" target="_blank">Jinsu Ahn</a><br></p>
</div>
</div>
<div class="detail-layout">
<div class="detail-media-area"></div>
<div class="detail-text-col prose-content"></div>
<aside class="detail-toc-col">
<ul class="toc-nav">${tocItems}</ul>
</aside>
</div>
<div class="pz-raw-content" style="position: fixed; top: 0; left: 0; width: 0; height: 0; overflow: hidden; pointer-events: none;">${rawContent}</div>
</div>`

  return htmlShell({
    title: 'Vor dem Gesetz',
    content,
    scripts: ['/js/app.js', '/js/prozess.js'],
  })
}

// ── GESTALTERISCHE THESIS PAGE ──────────────────────────────────────────────
// Reine Medienseite (kein Fliesstext, keine TOC): Hero-Video über die volle
// Breite, darunter zwei unabhängige Bildspalten (Masonry-Anmutung). Quelle ist
// build/content/gestalterisch.json.

export function gestalterischPage(doc) {
  const hero = doc.hero || {}
  // Lesereihenfolge = Reihenfolge in `items`; der Hero steht davor. Diese
  // Indizes steuern die Reihenfolge in der Lightbox.
  const heroHtml = hero.src
    ? `<div class="gestalt-hero"><video data-src="${hero.src}" width="${hero.w || ''}" height="${hero.h || ''}" loop muted playsinline preload="none" data-gallery-index="0"></video></div>`
    : ''

  const items = doc.items || []
  const cols = [1, 2]
    .map((colNr) => {
      const inner = items
        .map((item, i) => ({ item, i }))
        .filter(({ item }) => (item.col || 1) === colNr)
        .map(
          ({ item, i }) =>
            `<img src="${item.src}" alt="" width="${item.w || ''}" height="${item.h || ''}" loading="lazy" data-gallery-index="${i + 1}">`,
        )
        .join('')
      return `<div class="gestalt-col">${inner}</div>`
    })
    .join('')

  const content = `${topbar('Gestalterische Thesis')}
<div>
<div class="detail-header">
<div class="detail-intro-meta">
<p><strong>Mentorierende</strong><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/marianna-helen-meyer" target="_blank">Marianna Helen Meyer</a><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/jinsu-ahn" target="_blank">Jinsu Ahn</a><br></p>
</div>
</div>
<div class="gestalt-gallery">
${heroHtml}
<div class="gestalt-cols">${cols}</div>
</div>
</div>`

  return htmlShell({
    title: 'Vor dem Gesetz',
    content,
    scripts: ['/js/app.js', '/js/gestalterisch.js'],
  })
}

// ── KULTURGESCHICHTLICH PAGE ────────────────────────────────────────────────

const KG_TOC = [
  { id: '1', label: 'Einleitung', level: 1 },
  { id: '2', label: 'Lesen am Bildschirm', level: 1 },
  { id: '21', label: 'Der digitale Leseprozess', level: 2 },
  { id: '22', label: 'Aufmerksamkeit und Textverständnis', level: 2 },
  { id: '23', label: 'Konzentration als Ergebnis', level: 2 },
  { id: '24', label: 'Gedächtnis und kognitive Belastung', level: 2 },
  { id: '3', label: 'Gestalterische Eingriffe', level: 1 },
  { id: '31', label: 'Bewegung als Aufmerksamkeitsmittel', level: 2 },
  { id: '32', label: 'Emotionale Dimension', level: 2 },
  { id: '33', label: 'Bewegung als Fragmentierung', level: 2 },
  { id: '34', label: 'Hierarchie, Struktur, Hervorhebung', level: 2 },
  { id: '4', label: 'Interaktion als Steuerungsmittel', level: 1 },
  { id: '41', label: 'Steuerung und Kontrolle', level: 2 },
  { id: '42', label: 'RSVP und Grenzen der Kontrolle', level: 2 },
  { id: '43', label: 'Nichtlineare Strukturen', level: 2 },
  { id: '5', label: 'Verständnis als Ziel', level: 1 },
  { id: '51', label: 'Zugänglichkeit', level: 2 },
  { id: '52', label: 'Eye-Catcher und Überleitung', level: 2 },
  { id: '53', label: 'Kognitive Überlastung', level: 2 },
  { id: '6', label: 'Zusammenfassung', level: 1 },
  { id: '7', label: 'Fazit', level: 1 },
  { id: '8', label: 'Anhang', level: 1 },
  { id: '81', label: 'Literaturverzeichnis', level: 2 },
  { id: '82', label: 'Abbildungsverzeichnis', level: 2 },
  { id: '83', label: 'Weitere Quellen / Dokumente', level: 2 },
  { id: '84', label: 'Hilfsmittelverzeichnis', level: 2 },
  { id: '85', label: 'Glossar', level: 2 },
  { id: '9', label: 'Eigenständigkeitserklärung', level: 1 },
]

export function kulturgeschichtlichPage(doc) {
  const tocItems = KG_TOC.map((item) => {
    const num =
      item.level === 1 ? `${item.id}.` : `${item.id.slice(0, 1)}.${item.id.slice(1)}`
    return `<li class="${item.level === 1 ? 'toc-h1' : 'toc-h2'}"><a href="#${item.id}" data-toc-id="${item.id}" data-scroll-id="${item.id}">${num} ${item.label}</a></li>`
  }).join('')

  const rawContent = renderBody(doc)

  const content = `${topbar('Kulturgeschichtliche Thesis')}
<div>
<div class="detail-header">
<div class="detail-intro-meta">
<p><strong>Bewegtes Lesen</strong><br>Interaktive Typografie als Medium für Aufmerksamkeit und Textverständnis</p>
<p><strong>Mentorierender</strong><br>
<a href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/invar-torre-hollaus" target="_blank">Dr. Invar-Torre Hollaus</a></p>
<p><strong>Download</strong><br>
<a href="/assets/kulturgeschichtlich/Hecht_Lukas.pdf" download>PDF</a></p>
</div>
</div>
<div class="detail-layout">
<div class="detail-media-area"></div>
<div class="detail-text-col prose-content"></div>
<aside class="detail-toc-col">
<ul class="toc-nav">${tocItems}</ul>
</aside>
</div>
<div class="kg-raw-content" style="position: absolute; left: -9999px; opacity: 0; pointer-events: none;">
<div class="prose-content">${rawContent}</div>
</div>
</div>`

  return htmlShell({
    title: 'Vor dem Gesetz',
    content,
    scripts: ['/js/app.js', '/js/kulturgeschichtlich.js'],
  })
}
