# Vor dem Gesetz — statische Website

Statische Website (reines HTML/CSS/JS, kein Framework zur Laufzeit). Früher
Nuxt 3 + Vue + @nuxt/content; jetzt ein kleines Node-Build-Script, das fertige
statische Seiten erzeugt. Aussehen und Verhalten sind 1:1 identisch zur
früheren Version (pixelgenau verifiziert auf den Detailseiten).

## Befehle

```bash
npm install
npm run build     # erzeugt dist/
npm run preview   # baut + serviert dist/ auf http://localhost:3002
npm run dev       # alias für preview
```

## Struktur

```
build/
  build.mjs          Orchestriert den Build (Assets kopieren, Seiten schreiben, CSS kompilieren)
  templates.mjs      HTML-Gerüste der drei Seiten (aus den Vue-Templates portiert)
  render.mjs         AST(JSON) → HTML, repliziert MediaImage/MediaVideo/ContentRenderer
  tailwind.config.js Tailwind-Scan-Konfiguration für den Build
  content/*.json     Inhalts-Quelle (geparste @nuxt/content-ASTs) → die Build-Quelle
content/*.md         Original-Markdown, als Referenz behalten (nicht im Build verwendet)
src/
  styles.src.css     Quelle für styles.css (Tailwind base/utilities + eigenes CSS)
  js/
    app.js           Theme, Cursor, Lightbox, Navigation/Fade, Scroll-Restore
    index.js         Startseite: Wellen-Typografie + Nav-Videos
    prozess.js       Prozessseite: DOM-Restrukturierung + Hover-Medien
    kulturgeschichtlich.js  Thesis-Seite: dito
public/              Assets, Fonts, favicon → wird nach dist/ kopiert
dist/                Build-Ausgabe (statische Site, deploybar)
vercel.json          Static-Deploy-Config (cleanUrls)
```

## Inhalt bearbeiten

Die Build-Quelle ist `build/content/*.json` (geparste Inhalte). Die
`content/*.md` bleiben als lesbare Referenz erhalten. Inhaltsänderungen werden
im JSON gepflegt (gleiche Struktur wie @nuxt/content: `body.children` mit
`tag`/`props`/`children`; Medien als `media-image`/`media-video`-Knoten).

## Behobene Punkte gegenüber der Vue-Version

- **Resize-Lag**: Die Wellen-Typografie der Startseite baute bei *jedem*
  Resize (auch reinem Höhen-Resize) das komplette DOM neu auf (~96 Rebuilds).
  Jetzt nur noch bei tatsächlicher Breitenänderung, debounced → 0 Rebuilds bei
  vertikalem Resize.
- **Grid-Überlappung Prozessdoku**: Bei bestimmten Bildschirmbreiten
  überlappten sich die Bilder in den Bulk-Galerien, weil die Grid-Zeilen auf
  die fixe Slot-Höhe verteilt statt nach Inhalt bemessen wurden. Behoben mit
  `grid-auto-rows: min-content`.
