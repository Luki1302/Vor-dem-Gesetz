<script setup>
definePageMeta({ layout: "home" });

const vorwortText = `Ein Mann steht vor einer Tür. Der Türhüter lässt ihn nicht hindurch, verbietet es ihm aber auch nicht. Also wartet er ein Leben lang.
In Kafkas Türhüterparabel erkannte ich etwas Vertrautes. Auch ich sitze täglich vor einer Art Tür. Sie leuchtet in meiner Hand, reagiert auf jede Berührung und verspricht mir Zugang zu allem. Und trotzdem ertappe ich mich dabei, wie ich lese, ohne anzukommen – tippe, wische, scrolle und kann am Ende nicht sagen, was ich eigentlich gelesen habe.
Genau hier beginnt diese Arbeit: an der Schwelle zwischen Zugang und Distanz, zwischen Lesen und Verstehen.
`;

const vorwortEl = ref(null);
let lineDivs = [];
let smoothY = -1;
let targetY = -1;
let rafId = null;
let resizeTimer = null;

function debouncedBuildLines() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(buildLines, 150);
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function buildLines() {
  const container = vorwortEl.value;
  if (!container) return;

  container.style.whiteSpace = "normal";
  container.innerHTML = vorwortText
    .split(" ")
    .map((w) => `<span>${w} </span>`)
    .join("");

  const spans = Array.from(container.querySelectorAll("span"));
  const lineMap = new Map();
  spans.forEach((span) => {
    const top = Math.round(span.getBoundingClientRect().top);
    if (!lineMap.has(top)) lineMap.set(top, []);
    lineMap.get(top).push(span.textContent);
  });

  container.innerHTML = "";
  lineDivs = [];
  Array.from(lineMap.values()).forEach((words) => {
    const div = document.createElement("div");
    div.textContent = words.join("").trimEnd();
    div.style.whiteSpace = "nowrap";
    div.style.willChange = "transform";
    container.appendChild(div);
    lineDivs.push(div);
  });

  const isDesktop =
    window.innerWidth > 1024 && window.matchMedia("(pointer: fine)").matches;
  if (isDesktop) {
    applyWave();
  } else {
    lineDivs.forEach((div) => {
      div.style.transform = "translateX(0)";
    });
  }
}

function applyWave() {
  const n = lineDivs.length;
  if (n === 0) return;
  const vw = window.innerWidth;
  const A = vw * 0.25;
  const phase = smoothY * (Math.PI / 2);

  lineDivs.forEach((div, i) => {
    const t = n > 1 ? i / (n - 1) : 0;
    const x = A * Math.sin(Math.PI * t + phase);
    div.style.transform = `translateX(${Math.max(0, x)}px)`;
  });
}

let idleFrames = 0;

function onMouseMove(e) {
  targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  idleFrames = 0;
  if (!rafId) tick();
}

function tick() {
  smoothY = lerp(smoothY, targetY, 0.08);
  applyWave();
  idleFrames++;
  if (idleFrames < 120) {
    rafId = requestAnimationFrame(tick);
  } else {
    rafId = null;
  }
}

onMounted(() => {
  buildLines();

  if (
    window.innerWidth > 1024 &&
    window.matchMedia("(pointer: fine)").matches
  ) {
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    tick();
  }

  window.addEventListener("resize", debouncedBuildLines, { passive: true });

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.play().catch(() => {});
        } else {
          entry.target.pause();
        }
      });
    },
    { rootMargin: "200px" },
  );
  document.querySelectorAll(".start-nav-cover video").forEach((v) => {
    videoObserver.observe(v);
  });

  onUnmounted(() => videoObserver.disconnect());
});

onUnmounted(() => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("resize", debouncedBuildLines);
  clearTimeout(resizeTimer);
  if (rafId) cancelAnimationFrame(rafId);
});
</script>

<template>
  <div class="start-wrap">
    <!-- Hero -->
    <section class="start-hero">
      <h1 class="start-title">
        <span>Vor dem</span>
        <span>Gesetz</span>
      </h1>
    </section>

    <!-- Subtitle row -->
    <section class="start-subtitle-row">
      <div class="start-intro-right">
        <p class="start-subtitle">
          Interaktive Typografie<br>zwischen Kontrolle und Kontrollverlust
        </p>
        <p class="start-subtitle" style="text-indent: 4vw">Lukas Hecht</p>
      </div>
    </section>

    <!-- Typo interaction -->
    <section class="start-vorwort-section" style="overflow: hidden">
      <div ref="vorwortEl" class="start-vorwort">{{ vorwortText }}</div>
    </section>

    <!-- 4-column grid -->
    <div class="start-grid">
      <div class="start-mode-toggle">
        <div class="mode-toggle"><ThemeToggle /></div>
      </div>
      <div class="start-block">
        <h3 class="start-block-label">Thema und Fragestellung</h3>
        <p>
          Lesen ist nicht nur ein kognitiver Prozess, sondern eine körperliche
          Interaktion zwischen lesender Person, Text und Interface.
          Augenbewegung, Aufmerksamkeit und Handlungsmöglichkeiten bestimmen
          dabei, wie ein Text im Moment des Lesens erfasst werden kann. Die
          Arbeit untersucht, wie sich diese Interaktion zwischen Körper und Text
          im digitalen Lesen verändert und wie Bewegung, Reaktion und
          Unterbrechung den Zugang zum Text strukturieren.
        </p>
      </div>

      <div class="start-block">
        <h3 class="start-block-label">Relevanz des Themas</h3>
        <p>
          Das Smartphone ist heute eines der wichtigsten Lesemedien. Während
          digitale Texte jederzeit verfügbar sind, konkurrieren sie permanent
          mit Benachrichtigungen, Algorithmen und anderen Formen der
          Aufmerksamkeitslenkung. Lesen wird dadurch zunehmend zu einem
          gesteuerten Prozess, in dem Interfaces beeinflussen, was sichtbar ist
          und wie Inhalte wahrgenommen werden.
        </p>
      </div>

      <div class="start-block">
        <h3 class="start-block-label">Motivation</h3>
        <p>
          Mich interessiert die Diskrepanz zwischen gefühlter Kontrolle und
          tatsächlicher Steuerung beim digitalen Lesen. Digitale Interfaces
          vermitteln den Eindruck, jederzeit Zugang zu Informationen zu haben,
          während sie gleichzeitig Aufmerksamkeit lenken und
          Handlungsmöglichkeiten vorgeben.
        </p>
      </div>

      <div class="start-block">
        <h3 class="start-block-label">Zielsetzung</h3>
        <p>
          Ziel der Arbeit ist es, die Bedingungen des Lesens im digitalen Raum
          zu untersuchen und die Rolle von Bewegung, Interaktion und Kontrolle
          im Leseprozess erfahrbar zu machen. Was die kulturgeschichtliche
          Thesis theoretisch herleitet, soll in der Installation körperlich als
          Erfahrung spürbar sein, die über das Lesen eines Textes hinausgeht.
        </p>
      </div>

      <!-- Prozessdokumentation -->
      <NuxtLink to="/gestalterisch/prozess" class="start-nav">
        <div class="start-nav-cover">
          <video
            src="/assets/start/start-2.mp4"
            muted
            loop
            playsinline
            preload="none"
          ></video>
        </div>
        <div class="start-nav-info">
          <h3 class="start-block-label">Prozessdokumentation</h3>
          <p>
            Monatliche Dokumentation des gestalterischen Prozesses –
            Experimente, Interviews und Recherchen.
          </p>
        </div>
      </NuxtLink>

      <!-- Kulturgeschichtliche Thesis -->
      <NuxtLink to="/kulturgeschichtlich" class="start-nav">
        <div class="start-nav-cover">
          <video
            src="/assets/start/start-3.mp4"
            muted
            loop
            playsinline
            preload="none"
          ></video>
        </div>
        <div class="start-nav-info">
          <h3 class="start-block-label">Kulturgeschichtliche Thesis</h3>
          <p>
            Ausgangspunkt ist die Veränderung des Lesens im Übergang vom
            analogen zum digitalen Raum. Die Arbeit untersucht, wie kognitive
            Prozesse des Lesens – Fixationen, Regressionen, Aufmerksamkeit und
            Gedächtnis – mit gestalterischen Eingriffen interagieren und welche
            Rolle dabei Bewegung, Interaktion und Kontrolle spielen.
            Perspektiven aus der Leseforschung und der aktuellen
            Gestaltungspraxis werden miteinander verknüpft.
          </p>
        </div>
      </NuxtLink>

      <!-- Impressum -->
      <footer class="start-impressum">
        <strong>Bachelor Thesis 2026</strong>
        <strong>Konzept und Gestaltung</strong>
        Lukas Hecht<br />
        <strong>Mentorierende</strong>
        Marianna Helen Meyer<br />Jinsu Ahn<br />Dr. Invar-Torre Hollaus<br />
        <strong>Danke auch an</strong>
        Prof. Marion Fink<br />Dr. Philipp Stamm<br />Dr. Paloma López
        Grüninger<br />Ted Davis<br />Gabriele Forster<br />Martin Golombek<br />Katharina
        Kemmerling<br />
        <strong>Schriften</strong>
        ABC Daily Slab Variable Edu<br />
        ABC Diatype Mono Variable Edu<br /><br />
        FHNW, Hochschule für Gestaltung und Kunst Basel<br />
        Institut Digitale Kommunikationsumgebungen<br />
        Bachelor Visuelle Kommunikation und digitale Räume<br />
        Vertiefung: digitale Räume<br /><br />
        © 2026 Lukas Hecht / FHNW HGK Basel.<br />Alle Rechte vorbehalten.
      </footer>
    </div>
  </div>
</template>
