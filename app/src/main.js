// main.js — Vice Cover Studio: the editor wiring.
// Loads sample scenes as the default photos, lets the user swap any panel
// for their own uploaded photo, pan and zoom each panel, pick a size, a
// grade and a caption, and export the cover as a PNG. Everything runs
// offline in the browser; photos never leave the machine.

import { SIZES, GRADES, renderCover } from "./cover.js";
import { SCENES, paintScene } from "./samples.js";
import { readShotParams, runCoverShot, defaultPanels } from "./shots.js";

const $ = (id) => document.getElementById(id);

const state = {
  sizeKey: "poster",
  gradeKey: "sunset",
  caption: "SUNSET HEIST",
  tagline: "A VICE CITY STORY",
  seed: 7,
  // one slot per panel: { image, zoom, ox, oy, label }
  panels: [],
};

const canvas = $("cover");
const statusEl = $("status");

function setStatus(text) {
  statusEl.textContent = text;
}

function render() {
  renderCover(canvas, {
    sizeKey: state.sizeKey,
    caption: state.caption,
    tagline: state.tagline,
    gradeKey: state.gradeKey,
    seed: state.seed,
    panels: state.panels,
  });
  canvas.style.aspectRatio = `${SIZES[state.sizeKey].w} / ${SIZES[state.sizeKey].h}`;
}

function loadUpload(file, slotIndex) {
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      state.panels[slotIndex] = {
        image: img,
        zoom: 1,
        ox: 0,
        oy: 0,
        label: file.name,
      };
      refreshPanelRow(slotIndex);
      render();
      setStatus(`Loaded “${file.name}” into panel ${slotIndex + 1}.`);
    };
    img.onerror = () => setStatus(`Could not read “${file.name}” as an image.`);
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function useSampleScene(slotIndex, sceneId) {
  state.panels[slotIndex] = {
    image: paintScene(sceneId, 1080, 1080),
    zoom: 1.05,
    ox: 0,
    oy: 0,
    label: SCENES.find((s) => s.id === sceneId).name,
  };
  refreshPanelRow(slotIndex);
  render();
  setStatus(`Panel ${slotIndex + 1} is now the ${sceneId} scene.`);
}

function buildPanelRows() {
  const host = $("panels");
  host.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const row = document.createElement("div");
    row.className = "panel-row";
    row.id = `panel-row-${i}`;
    const title = document.createElement("h3");
    title.textContent = `Panel ${i + 1} — ${i === 0 ? "hero" : "support"}`;
    const label = document.createElement("p");
    label.className = "panel-label";
    label.id = `panel-label-${i}`;
    const fileLabel = document.createElement("label");
    fileLabel.className = "file-btn";
    fileLabel.textContent = "Upload photo";
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.hidden = true;
    fileInput.addEventListener("change", () => {
      if (fileInput.files[0]) loadUpload(fileInput.files[0], i);
    });
    fileLabel.appendChild(fileInput);
    const sampleRow = document.createElement("div");
    sampleRow.className = "sample-row";
    for (const scene of SCENES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sample-btn";
      btn.textContent = scene.name;
      btn.addEventListener("click", () => useSampleScene(i, scene.id));
      sampleRow.appendChild(btn);
    }
    const zoomLabel = document.createElement("label");
    zoomLabel.className = "zoom-label";
    zoomLabel.textContent = "Zoom";
    const zoom = document.createElement("input");
    zoom.type = "range";
    zoom.min = "1";
    zoom.max = "2.5";
    zoom.step = "0.05";
    zoom.value = "1.05";
    zoom.id = `zoom-${i}`;
    zoom.addEventListener("input", () => {
      state.panels[i].zoom = Number(zoom.value);
      render();
    });
    zoomLabel.appendChild(zoom);
    row.append(title, label, fileLabel, sampleRow, zoomLabel);
    host.appendChild(row);
  }

  // Drag the preview to pan the hero panel.
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const rect = canvas.getBoundingClientRect();
    state.panels[0].ox += (e.clientX - lastX) / rect.width;
    state.panels[0].oy += (e.clientY - lastY) / rect.height;
    lastX = e.clientX;
    lastY = e.clientY;
    render();
  });
  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });
}

function refreshPanelRow(i) {
  const label = $(`panel-label-${i}`);
  if (label) label.textContent = state.panels[i].label || "Sample scene";
  const zoom = $(`zoom-${i}`);
  if (zoom) zoom.value = String(state.panels[i].zoom || 1);
}

function exportPng(sizeKey) {
  const off = document.createElement("canvas");
  renderCover(off, {
    sizeKey,
    caption: state.caption,
    tagline: state.tagline,
    gradeKey: state.gradeKey,
    seed: state.seed,
    panels: state.panels,
  });
  const name = `vice-cover-${sizeKey}-${state.caption
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}.png`;
  off.toBlob((blob) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    setStatus(`Exported ${name} (${SIZES[sizeKey].w} × ${SIZES[sizeKey].h}).`);
  }, "image/png");
}

function initControls() {
  const sizeHost = $("sizes");
  for (const [key, size] of Object.entries(SIZES)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (key === state.sizeKey ? " active" : "");
    btn.textContent = size.label;
    btn.addEventListener("click", () => {
      state.sizeKey = key;
      sizeHost.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    sizeHost.appendChild(btn);
  }

  const gradeHost = $("grades");
  for (const [key, grade] of Object.entries(GRADES)) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "chip" + (key === state.gradeKey ? " active" : "");
    btn.textContent = grade.name;
    btn.addEventListener("click", () => {
      state.gradeKey = key;
      gradeHost.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      render();
    });
    gradeHost.appendChild(btn);
  }

  $("caption").addEventListener("input", (e) => {
    state.caption = e.target.value || "UNTITLED";
    render();
  });
  $("tagline").addEventListener("input", (e) => {
    state.tagline = e.target.value;
    render();
  });
  $("export").addEventListener("click", () => exportPng(state.sizeKey));
  $("export-all").addEventListener("click", () => {
    for (const key of Object.keys(SIZES)) exportPng(key);
    setStatus("Exported all four sizes.");
  });
  $("shuffle").addEventListener("click", () => {
    state.seed = (state.seed * 9301 + 49297) % 233280;
    const scenes = [...SCENES].sort(() => 0.5 - Math.random());
    state.panels = scenes.map((s) => ({
      image: paintScene(s.id, 1080, 1080),
      zoom: 1.05,
      ox: 0,
      oy: 0,
      label: s.name,
    }));
    state.panels.forEach((_, i) => refreshPanelRow(i));
    render();
    setStatus("Shuffled the panels and the grain.");
  });
}

function init() {
  const params = readShotParams();
  if (params.shot === "cover") {
    runCoverShot(params);
    setStatus("Cover shot.");
    return;
  }
  state.panels = defaultPanels(params.scene);
  state.caption = params.caption;
  state.tagline = params.tagline;
  state.sizeKey = params.sizeKey in SIZES ? params.sizeKey : "poster";
  state.gradeKey = params.gradeKey in GRADES ? params.gradeKey : "sunset";
  if (params.shot === "editor") document.body.classList.add("shot-editor");
  $("caption").value = state.caption;
  $("tagline").value = state.tagline;
  buildPanelRows();
  initControls();
  state.panels.forEach((_, i) => refreshPanelRow(i));
  render();
  setStatus("Sample photos loaded — upload your own, or export as-is.");
  window.__shotReady = true;
}

init();
