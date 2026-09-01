/**
 * app.js
 * ------------------------------------------------------------------
 * Toda la lógica de la biblioteca de vídeo: carga del catálogo JSON,
 * renderizado de tarjetas, búsqueda/filtros, reproductor con controles
 * propios, y persistencia de favoritos/progreso mediante localStorage.
 *
 * El archivo está organizado en secciones independientes para que sea
 * fácil de leer y modificar:
 *   1. Configuración y estado
 *   2. Almacenamiento local (favoritos / historial / progreso)
 *   3. Carga de datos
 *   4. Renderizado de tarjetas y estanterías
 *   5. Búsqueda, filtros y orden
 *   6. Vista de reproducción y controles del <video>
 *   7. Inicialización
 * ------------------------------------------------------------------
 */

/* ===================== 1. CONFIGURACIÓN Y ESTADO ===================== */

const STORAGE_KEYS = {
  favorites: "videolib_favorites",
  progress: "videolib_progress", // { [id]: { time, duration, updatedAt } }
};

const state = {
  videos: [],          // catálogo completo, tal cual viene del JSON
  filtered: [],        // catálogo tras aplicar búsqueda + filtro de categoría
  category: CONFIG.defaultCategory || "Todos",
  query: "",
  sort: "recent",
  currentVideo: null,  // vídeo actualmente en reproducción
};

/** Aplica los colores y textos definidos en config.js al documento. */
function applyConfigToPage() {
  const root = document.documentElement.style;
  root.setProperty("--primary-color", CONFIG.primaryColor);
  root.setProperty("--secondary-color", CONFIG.secondaryColor);
  root.setProperty("--background-color", CONFIG.backgroundColor);
  root.setProperty("--card-color", CONFIG.cardColor);
  root.setProperty("--text-color", CONFIG.textColor);

  document.title = `${CONFIG.siteName} — ${CONFIG.siteDescription}`;
  document.getElementById("siteName").textContent = CONFIG.siteName;
  document.getElementById("siteDescription").textContent = CONFIG.siteDescription;
}

/* ============ 2. ALMACENAMIENTO LOCAL (favoritos / progreso) ============ */

function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites)) || [];
  } catch {
    return [];
  }
}

function setFavorites(ids) {
  localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(ids));
}

function isFavorite(id) {
  return getFavorites().includes(id);
}

function toggleFavorite(id) {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) favs.push(id);
  else favs.splice(idx, 1);
  setFavorites(favs);
}

function getProgressMap() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.progress)) || {};
  } catch {
    return {};
  }
}

function saveProgress(id, time, duration) {
  const map = getProgressMap();
  map[id] = { time, duration, updatedAt: Date.now() };
  localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(map));
}

function getProgress(id) {
  return getProgressMap()[id] || null;
}

/** Devuelve los vídeos "en curso" (con progreso guardado y no terminados), más recientes primero. */
function getContinueWatchingList(videos) {
  const map = getProgressMap();
  const threshold = CONFIG.finishedThreshold ?? 0.95;

  return videos
    .filter((v) => {
      const p = map[v.id];
      if (!p || !p.duration) return false;
      const ratio = p.time / p.duration;
      return ratio > 0.02 && ratio < threshold;
    })
    .sort((a, b) => map[b.id].updatedAt - map[a.id].updatedAt)
    .slice(0, CONFIG.maxContinueWatching || 10);
}

/* ===================== 3. CARGA DE DATOS ===================== */

async function loadVideos() {
  const grid = document.getElementById("libraryGrid");
  try {
    const response = await fetch(CONFIG.dataSource);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.videos = Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("No se pudo cargar videos.json:", err);
    grid.innerHTML = `<p class="empty-state">No se pudo cargar el catálogo (videos.json). Revisa la consola para más detalles.</p>`;
    state.videos = [];
  }
}

/* ============ 4. RENDERIZADO DE TARJETAS Y ESTANTERÍAS ============ */

function formatMeta(video) {
  const parts = [];
  if (video.season != null) parts.push(`T${video.season}`);
  if (video.episode != null) parts.push(`E${video.episode}`);
  if (video.category) parts.push(video.category);
  return parts.join(" · ");
}

/** Crea el elemento DOM de una tarjeta de vídeo. */
function createVideoCard(video) {
  const card = document.createElement("article");
  card.className = "video-card";
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `Reproducir ${video.title}`);

  const progress = getProgress(video.id);
  const progressPct =
    progress && progress.duration ? Math.min(100, (progress.time / progress.duration) * 100) : 0;

  card.innerHTML = `
    <div class="card-thumb-wrap">
      <img src="${video.thumbnail}" alt="Portada de ${video.title}" loading="lazy" />
      ${isFavorite(video.id) ? '<span class="card-fav-indicator">★</span>' : ""}
      ${progressPct > 0 ? `<span class="card-progress" style="width:${progressPct}%"></span>` : ""}
    </div>
    <div class="card-body">
      <h3 class="card-title">${escapeHtml(video.title)}</h3>
      <p class="card-meta">${escapeHtml(formatMeta(video))}</p>
      <p class="card-desc">${escapeHtml(video.description || "")}</p>
    </div>
  `;

  const open = () => openPlayer(video.id);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return card;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}

function renderRow(containerId, sectionId, videos) {
  const container = document.getElementById(containerId);
  const section = document.getElementById(sectionId);
  container.innerHTML = "";

  if (!videos.length) {
    if (section) section.hidden = true;
    return;
  }
  if (section) section.hidden = false;
  videos.forEach((v) => container.appendChild(createVideoCard(v)));
}

function renderCategories() {
  const list = document.getElementById("categoryList");
  const categories = ["Todos", ...new Set(state.videos.map((v) => v.category).filter(Boolean))];

  list.innerHTML = "";
  categories.forEach((cat) => {
    const chip = document.createElement("button");
    chip.className = "category-chip" + (cat === state.category ? " active" : "");
    chip.textContent = cat;
    chip.addEventListener("click", () => {
      state.category = cat;
      renderCategories();
      applyFilters();
    });
    list.appendChild(chip);
  });
}

function renderLibrary() {
  const grid = document.getElementById("libraryGrid");
  const emptyState = document.getElementById("emptyState");

  grid.innerHTML = "";
  if (!state.filtered.length) {
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;
  state.filtered.forEach((v) => grid.appendChild(createVideoCard(v)));
}

function renderShelves() {
  renderRow("continueRow", "continueSection", getContinueWatchingList(state.videos));
  const favIds = getFavorites();
  renderRow(
    "favoritesRow",
    "favoritesSection",
    state.videos.filter((v) => favIds.includes(v.id))
  );
}

function renderAll() {
  renderCategories();
  applyFilters();
  renderShelves();
}

/* ===================== 5. BÚSQUEDA, FILTROS Y ORDEN ===================== */

function matchesQuery(video, query) {
  if (!query) return true;
  const haystack = [
    video.title,
    video.category,
    String(video.season ?? ""),
    String(video.episode ?? ""),
    video.description,
    ...(video.tags || []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function sortVideos(videos) {
  const list = [...videos];
  switch (state.sort) {
    case "title":
      return list.sort((a, b) => a.title.localeCompare(b.title, "es"));
    case "season":
      return list.sort((a, b) => (a.season - b.season) || (a.episode - b.episode));
    case "category":
      return list.sort((a, b) => (a.category || "").localeCompare(b.category || "", "es"));
    case "recent":
    default:
      return list.sort((a, b) => b.id - a.id);
  }
}

function applyFilters() {
  let list = state.videos;

  if (state.category && state.category !== "Todos") {
    list = list.filter((v) => v.category === state.category);
  }
  if (state.query) {
    list = list.filter((v) => matchesQuery(v, state.query));
  }
  state.filtered = sortVideos(list);
  renderLibrary();
}

/* ============ 6. VISTA DE REPRODUCCIÓN Y CONTROLES DEL <video> ============ */

const els = {}; // referencias a elementos del reproductor, rellenadas en init()

function getRelatedEpisodes(video) {
  return state.videos
    .filter((v) => v.category === video.category && v.id !== video.id)
    .sort((a, b) => (a.season - b.season) || (a.episode - b.episode));
}

function getSiblingEpisode(video, direction) {
  // direction: 1 = siguiente, -1 = anterior. Se navega dentro de la misma categoría,
  // ordenado por temporada y episodio.
  const siblings = [video, ...getRelatedEpisodes(video)].sort(
    (a, b) => (a.season - b.season) || (a.episode - b.episode)
  );
  const idx = siblings.findIndex((v) => v.id === video.id);
  const target = siblings[idx + direction];
  return target || null;
}

function openPlayer(id) {
  const video = state.videos.find((v) => v.id === id);
  if (!video) return;

  state.currentVideo = video;

  document.getElementById("mainView").hidden = true;
  document.getElementById("playerView").hidden = false;
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  document.getElementById("playerTitle").textContent = video.title;
  document.getElementById("playerMeta").textContent = formatMeta(video);
  document.getElementById("playerDescription").textContent = video.description || "";

  els.favoriteBtn.textContent = isFavorite(video.id) ? "★" : "☆";
  els.favoriteBtn.classList.toggle("is-active", isFavorite(video.id));

  // Fuente del vídeo: SIEMPRE una URL externa, nunca se descarga ni se copia.
  els.video.src = video.video;
  els.video.playbackRate = 1;
  els.speedSelect.value = "1";

  const saved = getProgress(video.id);
  const resumeTime = saved && saved.duration && saved.time / saved.duration < (CONFIG.finishedThreshold ?? 0.95)
    ? saved.time
    : 0;

  const onLoaded = () => {
    if (resumeTime > 1) els.video.currentTime = resumeTime;
    els.video.removeEventListener("loadedmetadata", onLoaded);
  };
  els.video.addEventListener("loadedmetadata", onLoaded);

  els.video.play().catch(() => {
    /* el navegador puede bloquear autoplay; el usuario pulsará play manualmente */
  });

  renderRow("relatedRow", null, getRelatedEpisodes(video));
  updateSiblingButtons(video);
}

function closePlayer() {
  els.video.pause();
  els.video.removeAttribute("src");
  els.video.load();

  document.getElementById("playerView").hidden = true;
  document.getElementById("mainView").hidden = false;

  // Refresca estanterías por si cambió el progreso o los favoritos.
  renderShelves();
  applyFilters();
}

function updateSiblingButtons(video) {
  els.prevBtn.disabled = !getSiblingEpisode(video, -1);
  els.nextBtn.disabled = !getSiblingEpisode(video, 1);
}

function formatTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

function setupPlayerControls() {
  els.video = document.getElementById("videoPlayer");
  els.playPauseBtn = document.getElementById("playPauseBtn");
  els.progressBar = document.getElementById("progressBar");
  els.timeCurrent = document.getElementById("timeCurrent");
  els.timeDuration = document.getElementById("timeDuration");
  els.volumeBar = document.getElementById("volumeBar");
  els.muteBtn = document.getElementById("muteBtn");
  els.speedSelect = document.getElementById("speedSelect");
  els.fullscreenBtn = document.getElementById("fullscreenBtn");
  els.favoriteBtn = document.getElementById("favoriteBtn");
  els.prevBtn = document.getElementById("prevEpisodeBtn");
  els.nextBtn = document.getElementById("nextEpisodeBtn");
  els.backBtn = document.getElementById("backToLibrary");
  els.stage = document.querySelector(".player-stage");

  els.backBtn.addEventListener("click", closePlayer);

  // Play / pausa
  els.playPauseBtn.addEventListener("click", () => {
    if (els.video.paused) els.video.play();
    else els.video.pause();
  });
  els.video.addEventListener("play", () => (els.playPauseBtn.textContent = "⏸"));
  els.video.addEventListener("pause", () => (els.playPauseBtn.textContent = "▶"));

  // Doble clic / clic sobre el vídeo también pausa o reproduce
  els.video.addEventListener("click", () => els.playPauseBtn.click());

  // Barra de progreso
  els.video.addEventListener("timeupdate", () => {
    if (!els.video.duration) return;
    els.progressBar.value = (els.video.currentTime / els.video.duration) * 100;
    els.timeCurrent.textContent = formatTime(els.video.currentTime);

    // Guarda el progreso cada pocos segundos, no en cada frame.
    if (Math.floor(els.video.currentTime) % 5 === 0 && state.currentVideo) {
      saveProgress(state.currentVideo.id, els.video.currentTime, els.video.duration);
    }
  });

  els.video.addEventListener("loadedmetadata", () => {
    els.timeDuration.textContent = formatTime(els.video.duration);
  });

  els.progressBar.addEventListener("input", () => {
    if (!els.video.duration) return;
    els.video.currentTime = (els.progressBar.value / 100) * els.video.duration;
  });

  // Al terminar: guarda progreso final y pasa al siguiente episodio si existe.
  els.video.addEventListener("ended", () => {
    if (state.currentVideo) {
      saveProgress(state.currentVideo.id, els.video.duration, els.video.duration);
    }
    const next = state.currentVideo && getSiblingEpisode(state.currentVideo, 1);
    if (next) openPlayer(next.id);
  });

  // Volumen
  els.volumeBar.addEventListener("input", () => {
    els.video.volume = Number(els.volumeBar.value);
    els.video.muted = els.video.volume === 0;
    els.muteBtn.textContent = els.video.muted ? "🔇" : "🔊";
  });
  els.muteBtn.addEventListener("click", () => {
    els.video.muted = !els.video.muted;
    els.muteBtn.textContent = els.video.muted ? "🔇" : "🔊";
  });

  // Velocidad
  els.speedSelect.addEventListener("change", () => {
    els.video.playbackRate = Number(els.speedSelect.value);
  });

  // Pantalla completa
  els.fullscreenBtn.addEventListener("click", () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      (els.stage.requestFullscreen || els.stage.webkitRequestFullscreen)?.call(els.stage);
    }
  });

  // Favoritos
  els.favoriteBtn.addEventListener("click", () => {
    if (!state.currentVideo) return;
    toggleFavorite(state.currentVideo.id);
    const active = isFavorite(state.currentVideo.id);
    els.favoriteBtn.textContent = active ? "★" : "☆";
    els.favoriteBtn.classList.toggle("is-active", active);
  });

  // Episodio anterior / siguiente
  els.prevBtn.addEventListener("click", () => {
    const prev = state.currentVideo && getSiblingEpisode(state.currentVideo, -1);
    if (prev) openPlayer(prev.id);
  });
  els.nextBtn.addEventListener("click", () => {
    const next = state.currentVideo && getSiblingEpisode(state.currentVideo, 1);
    if (next) openPlayer(next.id);
  });

  // Guarda el progreso también al salir de la página (cierre de pestaña, etc.)
  window.addEventListener("beforeunload", () => {
    if (state.currentVideo && els.video.duration) {
      saveProgress(state.currentVideo.id, els.video.currentTime, els.video.duration);
    }
  });
}

/* ===================== 7. INICIALIZACIÓN ===================== */

function setupSearchAndSort() {
  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", (e) => {
    state.query = e.target.value.trim();
    applyFilters();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    applyFilters();
  });
}

function setupQuickNav() {
  document.querySelectorAll(".nav-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.getElementById(btn.dataset.scroll);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

async function init() {
  applyConfigToPage();
  setupPlayerControls();
  setupSearchAndSort();
  setupQuickNav();

  await loadVideos();
  renderAll();
}

document.addEventListener("DOMContentLoaded", init);
