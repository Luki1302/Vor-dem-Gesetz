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
  templates.mjs      HTML-Gerüste der vier Seiten (aus den Vue-Templates portiert)
  render.mjs         AST(JSON) → HTML, repliziert MediaImage/MediaVideo/ContentRenderer
  tailwind.config.js Tailwind-Scan-Konfiguration für den Build
  content/*.json     Inhalts-Quelle (geparste @nuxt/content-ASTs) → die Build-Quelle
                     Ausnahme: gestalterisch.json ist eine einfache Medienliste
content/*.md         Original-Markdown, als Referenz behalten (nicht im Build verwendet)
src/
  styles.src.css     Quelle für styles.css (Tailwind base/utilities + eigenes CSS)
  js/
    app.js           Theme, Cursor, Lightbox, Navigation/Fade, Scroll-Restore,
                     Idle-Attract (40 s)
    index.js         Startseite: Wellen-Typografie + Nav-Videos
    prozess.js       Prozessseite: DOM-Restrukturierung + Hover-Medien
    kulturgeschichtlich.js  Kulturgeschichtliche Thesis: dito
    gestalterisch.js Gestalterische Thesis: Video/Ton, Lightbox, Idle-Hooks
public/              Assets, Fonts, favicon → wird nach dist/ kopiert
dist/                Build-Ausgabe (statische Site, deploybar)
vercel.json          Static-Deploy-Config (cleanUrls)
```

## Inhalt bearbeiten

Die Build-Quelle ist `build/content/*.json` (geparste Inhalte). Die
`content/*.md` bleiben als lesbare Referenz erhalten. Inhaltsänderungen werden
im JSON gepflegt (gleiche Struktur wie @nuxt/content: `body.children` mit
`tag`/`props`/`children`; Medien als `media-image`/`media-video`-Knoten).

`build/content/gestalterisch.json` ist die eine Ausnahme: Die Seite
«Gestalterische Thesis» (`/gestalterisch`) enthält keinen Fliesstext, sondern
nur Medien. Das JSON ist deshalb eine flache Liste – `hero` für das Video über
die volle Breite, `items` für die Bilder darunter. `col` bestimmt die Spalte
(1 = links, 2 = rechts), die Reihenfolge in `items` ist die Lesereihenfolge und
zugleich die Reihenfolge in der Lightbox. `w`/`h` sind die Originalmasse und
verhindern Layout-Sprünge beim Nachladen.

## Ton und Idle-Modus

Das Hero-Video der gestalterischen Thesis (`gestalterisch-1.mp4`) hat eine
Tonspur und läuft mit Ton, solange es zu mindestens 50 % im Sichtfeld ist.
Scrollt es aus dem Bild, wird es stummgeschaltet und pausiert.

Im Grossbildmodus (Lightbox) läuft der Ton dort weiter, das Video im
Hintergrund pausiert; nach dem Schliessen läuft es normal weiter. Den Ton in
der Lightbox fordert nur diese Seite an – `window.__openLightbox(items, index,
{ sound: true })`. Ohne diese Option bleiben alle anderen Seiten stumm wie
bisher.

Browser blockieren Autoplay mit Ton ohne vorherige Interaktion. Trifft das zu,
startet das Video stumm und wird beim ersten Klick oder Tastendruck
nachträglich entstummt. In Chrome lässt sich das für einen Kiosk-Betrieb mit
`--autoplay-policy=no-user-gesture-required` abschalten.

Nach 40 Sekunden ohne Eingabe (Maus, Tastatur, Scrollen, Touch) wechselt die
Site zurück auf `/gestalterisch` und stellt das Video mittig in den Viewport –
mit derselben Fade-Blende wie ein Seitenwechsel, nicht im Grossbildmodus. Steht
das Video bereits mittig, passiert nichts, damit die Seite im Leerlauf nicht
alle 40 Sekunden blinkt. Die Werte stehen als `IDLE_MS` / `IDLE_PATH` oben im
Abschnitt «IDLE-ATTRACT» von `src/js/app.js`.

## Behobene Punkte gegenüber der Vue-Version

- **Resize-Lag**: Die Wellen-Typografie der Startseite baute bei *jedem*
  Resize (auch reinem Höhen-Resize) das komplette DOM neu auf (~96 Rebuilds).
  Jetzt nur noch bei tatsächlicher Breitenänderung, debounced → 0 Rebuilds bei
  vertikalem Resize.
- **Grid-Überlappung Prozessdoku**: Bei bestimmten Bildschirmbreiten
  überlappten sich die Bilder in den Bulk-Galerien, weil die Grid-Zeilen auf
  die fixe Slot-Höhe verteilt statt nach Inhalt bemessen wurden. Behoben mit
  `grid-auto-rows: min-content`.
