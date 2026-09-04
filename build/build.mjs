// Static site builder. Produces a fully static `dist/` from:
//   - build/content/*.json   (parsed @nuxt/content ASTs, the content source)
//   - build/templates.mjs     (page HTML shells, ported from Vue)
//   - src/styles.css           (the original tailwind.css, compiled below)
//   - src/js/*.js              (page logic, ported from Vue <script> blocks)
//   - public/*                 (assets, fonts, favicon)
//
// No framework at runtime: the output is plain HTML/CSS/JS.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import { homePage, prozessPage, gestalterischPage, kulturgeschichtlichPage } from './templates.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const dist = join(root, 'dist')
const contentDir = join(__dirname, 'content')

function loadDoc(name) {
  return JSON.parse(readFileSync(join(contentDir, `${name}.json`), 'utf8'))
}

function ensureDir(p) {
  mkdirSync(p, { recursive: true })
}

function writePage(relPath, html) {
  const out = join(dist, relPath)
  ensureDir(dirname(out))
  writeFileSync(out, html)
  console.log('  ✓', relPath)
}

console.log('Building static site → dist/')

// Clean
rmSync(dist, { recursive: true, force: true })
ensureDir(dist)

// 1. Static assets (public/ → dist/)
cpSync(join(root, 'public'), dist, {
  recursive: true,
  filter: (src) => !src.endsWith('.DS_Store'),
})
console.log('  ✓ public assets')

// 2. Fonts already live under public/fonts → copied above.

// 3. JS modules (src/js → dist/js)
cpSync(join(root, 'src', 'js'), join(dist, 'js'), { recursive: true })
console.log('  ✓ js modules')

// 4. Pages
const months = [
  { slug: 'februar', label: 'Februar' },
  { slug: 'maerz', label: 'März' },
  { slug: 'april', label: 'April' },
  { slug: 'mai', label: 'Mai' },
  { slug: 'juni', label: 'Juni' },
].map((m) => ({ ...m, doc: loadDoc(m.slug) }))

writePage('index.html', homePage())
writePage('gestalterisch/index.html', gestalterischPage(loadDoc('gestalterisch')))
writePage('gestalterisch/prozess/index.html', prozessPage(months))
writePage('kulturgeschichtlich/index.html', kulturgeschichtlichPage(loadDoc('kulturgeschichtlich')))

// 5. Compile CSS (Tailwind base/utilities + custom CSS) → dist/styles.css.
// Scans the freshly written dist HTML so utility classes (w-full, w-1/2,
// h-auto, …) are detected exactly as Tailwind did under Nuxt.
console.log('  → compiling styles.css')
execFileSync(
  'npx',
  [
    'tailwindcss',
    '-c', join(root, 'build', 'tailwind.config.js'),
    '-i', join(root, 'src', 'styles.src.css'),
    '-o', join(dist, 'styles.css'),
    '--minify',
  ],
  { cwd: root, stdio: 'inherit' },
)
console.log('  ✓ styles.css')

console.log('Done.')
