<script setup>
definePageMeta({ layout: "default" });

const { data: page } = await useAsyncData("kulturgeschichtlich", () =>
  queryContent("/kulturgeschichtlich").findOne(),
);

const toc = [
  { id: "1", label: "Einleitung", level: 1 },
  { id: "2", label: "Lesen am Bildschirm", level: 1 },
  { id: "21", label: "Der digitale Leseprozess", level: 2 },
  { id: "22", label: "Aufmerksamkeit und Textverständnis", level: 2 },
  { id: "23", label: "Konzentration als Ergebnis", level: 2 },
  { id: "24", label: "Gedächtnis und kognitive Belastung", level: 2 },
  { id: "3", label: "Gestalterische Eingriffe", level: 1 },
  { id: "31", label: "Bewegung als Aufmerksamkeitsmittel", level: 2 },
  { id: "32", label: "Emotionale Dimension", level: 2 },
  { id: "33", label: "Bewegung als Fragmentierung", level: 2 },
  { id: "34", label: "Hierarchie, Struktur, Hervorhebung", level: 2 },
  { id: "4", label: "Interaktion als Steuerungsmittel", level: 1 },
  { id: "41", label: "Steuerung und Kontrolle", level: 2 },
  { id: "42", label: "RSVP und Grenzen der Kontrolle", level: 2 },
  { id: "43", label: "Nichtlineare Strukturen", level: 2 },
  { id: "5", label: "Verständnis als Ziel", level: 1 },
  { id: "51", label: "Zugänglichkeit", level: 2 },
  { id: "52", label: "Eye-Catcher und Überleitung", level: 2 },
  { id: "53", label: "Kognitive Überlastung", level: 2 },
  { id: "6", label: "Zusammenfassung", level: 1 },
  { id: "7", label: "Fazit", level: 1 },
  { id: "8", label: "Anhang", level: 1 },
  { id: "81", label: "Literaturverzeichnis", level: 2 },
  { id: "82", label: "Abbildungsverzeichnis", level: 2 },
  { id: "83", label: "Weitere Quellen / Dokumente", level: 2 },
  { id: "84", label: "Hilfsmittelverzeichnis", level: 2 },
  { id: "85", label: "Glossar", level: 2 },
  { id: "9", label: "Eigenständigkeitserklärung", level: 1 },
];

let activeSlotId = null;
const mediaMarkers = [];
const slotStore = new Map();
let scrollRaf = null;
let resizeTimer = null;
let resizing = false;
let mediaPoolEl = null;

function getOrientation(el) {
  const cls = el.className || "";
  const fig = el.querySelector("figure");
  const vid = el.querySelector("video");
  const img = el.querySelector("img");
  const dataSize = vid?.dataset?.size || "";
  if (dataSize === "xs") return "xs";
  if (dataSize === "mini") return "mini";
  if (dataSize === "klein") return "small";
  if (dataSize === "voll" || dataSize === "full") return "full";
  if (img?.classList?.contains("w-full")) return "full";
  if (img?.classList?.contains("img-xs")) return "xs";
  if (img?.classList?.contains("img-mini")) return "mini";
  if (img?.classList?.contains("img-klein")) return "small";
  if (
    fig?.className?.includes("figure-quer") ||
    vid?.className?.includes("video-quer") ||
    img?.classList?.contains("img-quer")
  )
    return "landscape";
  if (
    vid?.className?.includes("video-hoch") ||
    img?.classList?.contains("w-1/2")
  )
    return "portrait";
  return "landscape";
}

function showSlot(id) {
  if (activeSlotId === id) return;
  if (activeSlotId) {
    const prev = mediaPoolEl?.firstChild;
    if (prev) {
      prev.querySelectorAll("video").forEach((v) => {
        v.pause();
        v.removeAttribute("src");
      });
      prev.querySelectorAll("img").forEach((img) => {
        img.removeAttribute("src");
      });
      prev.remove();
    }
    document
      .querySelector(`.fig-ref[data-media-id="${activeSlotId}"]`)
      ?.classList.remove("active");
  }
  activeSlotId = id;
  if (!id) return;
  const data = slotStore.get(id);
  if (!data || !mediaPoolEl) return;

  const slot = document.createElement("div");
  slot.className = `detail-media-slot ${data.orient} active`;
  if (data.isBulk) {
    slot.classList.add("bulk");
    if (data.wrapperType === "gallery") slot.classList.add("bulk-3col");
    if (data.wrapperType === "duo") slot.classList.add("bulk-2col");
    if (data.wrapperType === "2x1") slot.classList.add("bulk-2x1");
  }

  const widthMap = {
    landscape: "100%",
    full: "85%",
    portrait: "75%",
    small: "60%",
    mini: "50%",
    xs: "40%",
  };

  data.items.forEach((item) => {
    if (item.type === "img") {
      const fig = document.createElement("figure");
      const img = document.createElement("img");
      img.src = item.src;
      if (!data.isBulk) {
        const w = widthMap[item.orient || data.orient] || "100%";
        fig.style.width = w;
        img.style.width = "100%";
      }
      fig.appendChild(img);
      slot.appendChild(fig);
    } else {
      const v = document.createElement("video");
      v.src = item.src;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.play().catch(() => {});
      slot.appendChild(v);
    }
  });

  const cap = document.createElement("div");
  cap.className = "media-caption";
  const numSpan = document.createElement("span");
  numSpan.className = "media-caption-num";
  numSpan.textContent = `[${data.num}]`;
  cap.appendChild(numSpan);
  const textSpan = document.createElement("span");
  textSpan.className = "media-caption-text";
  textSpan.innerHTML = data.caption || "";
  cap.appendChild(textSpan);
  slot.appendChild(cap);

  mediaPoolEl.appendChild(slot);
  document
    .querySelector(`.fig-ref[data-media-id="${id}"]`)
    ?.classList.add("active");
}

function restructureContent() {
  const content = document.querySelector(".kg-raw-content .content-page");
  if (!content) return;

  mediaPoolEl = document.querySelector(".detail-media-area");
  const textCol = document.querySelector(".detail-text-col");
  if (!mediaPoolEl || !textCol) return;

  let mediaCount = 0;
  const pairs = [];

  function isMediaEl(el) {
    const tag = el.tagName;
    const cls = el.className || "";
    return (
      tag === "FIGURE" ||
      tag === "VIDEO" ||
      cls.includes("moodboard") ||
      cls.includes("media-")
    );
  }

  content.querySelectorAll(":scope > section").forEach((section) => {
    const children = [...section.children];
    let lastTextEl = null;
    let pendingMedia = [];

    function flushMedia(captionAside) {
      if (!pendingMedia.length) return;

      mediaCount++;
      const mediaId = `km-${mediaCount}`;
      const hasWrapper = pendingMedia.some((el) => {
        const cls = el.className || "";
        return (
          cls.includes("media-gallery") ||
          cls.includes("media-trio") ||
          cls.includes("media-duo") ||
          cls.includes("media-2x1")
        );
      });
      const wrapperType = pendingMedia.find((el) =>
        (el.className || "").includes("media-2x1"),
      )
        ? "2x1"
        : pendingMedia.find((el) => (el.className || "").includes("media-duo"))
          ? "duo"
          : pendingMedia.find((el) =>
                (el.className || "").includes("media-gallery"),
              )
            ? "gallery"
            : "";
      const isBulk = hasWrapper || pendingMedia.length > 3;
      const orient = isBulk ? "bulk" : getOrientation(pendingMedia[0]);

      const items = [];
      pendingMedia.forEach((el) => {
        const cls = el.className || "";
        if (
          cls.includes("media-gallery") ||
          cls.includes("media-trio") ||
          cls.includes("media-duo") ||
          cls.includes("media-2x1")
        ) {
          el.querySelectorAll("img, video").forEach((child) => {
            if (child.tagName === "VIDEO") {
              items.push({
                type: "video",
                src: child.src || child.dataset.src || "",
                orient: "landscape",
              });
            } else {
              items.push({
                type: "img",
                src: child.src || child.dataset.src || "",
                orient: getOrientation(el),
              });
            }
          });
        } else {
          const img = el.querySelector("img");
          const vid = el.querySelector("video");
          const itemOrient = getOrientation(el);
          if (vid)
            items.push({
              type: "video",
              src: vid.src || vid.dataset.src || "",
              orient: itemOrient,
            });
          else if (img)
            items.push({
              type: "img",
              src: img.src || img.dataset?.src || "",
              orient: itemOrient,
            });
        }
      });

      slotStore.set(mediaId, {
        items,
        caption: captionAside ? captionAside.innerHTML : null,
        isBulk,
        wrapperType,
        orient,
        num: mediaCount,
      });

      const marker = document.createElement("span");
      marker.className = "fig-ref";
      marker.dataset.mediaId = mediaId;
      marker.textContent = `[${mediaCount}]`;
      marker.addEventListener("mouseenter", () => showSlot(mediaId));
      marker.addEventListener("click", (e) => {
        e.preventDefault();
        showSlot(mediaId);
      });

      if (lastTextEl && lastTextEl.parentNode === textCol) {
        const existingRefs =
          lastTextEl.querySelectorAll(":scope > .fig-ref").length;
        if (existingRefs > 0) {
          marker.style.top = `calc(var(--font-text-size) * 0.35 + ${existingRefs} * var(--font-konsult-size) * var(--font-text-lh))`;
        }
        lastTextEl.appendChild(marker);
      }

      pairs.push({ marker, slotId: mediaId });
      pendingMedia = [];
    }

    children.forEach((child) => {
      if (child.tagName === "H1" && !section.id) return;
      if (child.tagName === "H1" && section.id) {
        child.id = section.id;
      }
      if (isMediaEl(child)) {
        pendingMedia.push(child);
      } else if (child.tagName === "ASIDE" && pendingMedia.length > 0) {
        flushMedia(child);
      } else {
        flushMedia(null);
        textCol.appendChild(child);
        lastTextEl = textCol.lastElementChild;
      }
    });

    flushMedia(null);
  });

  mediaMarkers.push(...pairs);

  window.addEventListener(
    "scroll",
    () => {
      if (scrollRaf || resizing) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        if (!pairs.length || resizing) return;
        const vh = window.innerHeight;
        let best = -1;
        let bestDist = Infinity;
        pairs.forEach((p, i) => {
          const rect = p.marker.getBoundingClientRect();
          if (rect.top >= 0 && rect.top <= vh) {
            const dist = Math.abs(rect.top - vh * 0.4);
            if (dist < bestDist) {
              bestDist = dist;
              best = i;
            }
          }
        });
        if (best >= 0) showSlot(pairs[best].slotId);
        else showSlot(null);
        updateTocActive();
      });
    },
    { passive: true },
  );

  if (pairs.length) showSlot(pairs[0].slotId);
  updateTocActive();

  document.querySelector(".kg-raw-content")?.remove();
}

function updateTocActive() {
  const tocLinks = document.querySelectorAll(".toc-nav a[data-toc-id]");
  const sections = toc
    .map((t) => ({ id: t.id, el: document.getElementById(t.id) }))
    .filter((s) => s.el);
  let activeId = sections[0]?.id;
  const threshold = window.innerHeight * 0.3;
  for (const s of sections) {
    if (s.el.getBoundingClientRect().top <= threshold) activeId = s.id;
  }
  tocLinks.forEach((a) => {
    a.classList.toggle("active", a.dataset.tocId === activeId);
  });
}

onMounted(async () => {
  await nextTick();
  requestAnimationFrame(() => {
    restructureContent();
  });

  window.addEventListener(
    "resize",
    () => {
      resizing = true;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resizing = false;
      }, 200);
    },
    { passive: true },
  );
});

onUnmounted(() => {
  activeSlotId = null;
  mediaMarkers.length = 0;
  clearTimeout(resizeTimer);
});

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}
</script>

<template>
  <div>
    <div class="detail-header">
      <div class="detail-intro-meta">
        <p>
          <strong>Bewegtes Lesen</strong><br />Interaktive Typografie als Medium
          für Aufmerksamkeit und Textverständnis
        </p>
        <p>
          <strong>Mentorierender</strong><br />
          <a
            href="https://www.fhnw.ch/de/gestaltung-kunst/ueber-uns/portrait-organisation/personen/invar-torre-hollaus"
            target="_blank"
            >Dr. Invar-Torre Hollaus</a
          >
        </p>
        <p>
          <strong>Download</strong><br />
          <a href="/assets/kulturgeschichtlich/Hecht_Lukas.pdf" download>PDF</a>
        </p>
      </div>
    </div>

    <div class="detail-layout">
      <!-- Left: sticky media area -->
      <div class="detail-media-area"></div>

      <!-- Center: text column -->
      <div class="detail-text-col prose-content"></div>

      <!-- Right: TOC -->
      <aside class="detail-toc-col">
        <ul class="toc-nav">
          <li
            v-for="item in toc"
            :key="item.id"
            :class="item.level === 1 ? 'toc-h1' : 'toc-h2'"
          >
            <a
              :href="`#${item.id}`"
              :data-toc-id="item.id"
              @click.prevent="scrollTo(item.id)"
            >
              {{
                item.level === 1
                  ? `${item.id}.`
                  : `${item.id.slice(0, 1)}.${item.id.slice(1)}`
              }}
              {{ item.label }}
            </a>
          </li>
        </ul>
      </aside>
    </div>

    <!-- Hidden raw content for DOM restructuring -->
    <div
      class="kg-raw-content"
      style="
        position: absolute;
        left: -9999px;
        opacity: 0;
        pointer-events: none;
      "
    >
      <div class="prose-content" v-if="page">
        <ContentRenderer :value="page" />
      </div>
    </div>
  </div>
</template>
