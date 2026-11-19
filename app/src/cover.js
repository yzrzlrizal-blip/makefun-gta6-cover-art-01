// cover.js — the cover renderer. Given a size, a caption, a grade and one
// photo per panel, it paints a GTA VI-style multi-panel poster onto a canvas:
// angled photo panels with white keylines, a warm sunset or neon grade,
// bold italic title lettering with a hard outline, a tagline, grain and a
// vignette. Everything is drawn with the canvas 2D API — no images are
// loaded from anywhere. Deterministic for a fixed seed.

import { mulberry32 } from "./samples.js";

export const SIZES = {
  wide: { label: "Wide · 1920 × 1080", w: 1920, h: 1080, ratio: "16:9" },
  poster: { label: "Poster · 1080 × 1350", w: 1080, h: 1350, ratio: "4:5" },
  square: { label: "Square · 1080 × 1080", w: 1080, h: 1080, ratio: "1:1" },
  story: { label: "Story · 1080 × 1920", w: 1080, h: 1920, ratio: "9:16" },
};

export const GRADES = {
  sunset: { name: "Vice Sunset", top: "#ff2e63", mid: "#ff9e4f", deep: "#2b0a3d" },
  neon: { name: "Neon Night", top: "#ff2e88", mid: "#22d3ee", deep: "#0a0618" },
  pastel: { name: "Pastel Day", top: "#ff8fb1", mid: "#ffd166", deep: "#173a5e" },
  noir: { name: "Noir", top: "#8b8b9e", mid: "#d7d7e0", deep: "#05050a" },
};

// Panel layouts: fractions of the cover, with a slight rotation per panel.
// Each panel takes a photo (canvas or image) plus a pan/zoom.
function layoutsFor(sizeKey) {
  if (sizeKey === "wide") {
    return [
      { x: -0.02, y: -0.03, w: 0.62, h: 1.06, rot: -1.2, photo: 0 },
      { x: 0.6, y: -0.03, w: 0.42, h: 0.52, rot: 1.0, photo: 1 },
      { x: 0.6, y: 0.5, w: 0.42, h: 0.53, rot: -0.8, photo: 2 },
    ];
  }
  if (sizeKey === "story") {
    return [
      { x: -0.03, y: -0.02, w: 1.06, h: 0.6, rot: 0.8, photo: 0 },
      { x: -0.03, y: 0.57, w: 0.53, h: 0.45, rot: -1.1, photo: 1 },
      { x: 0.5, y: 0.57, w: 0.53, h: 0.45, rot: 1.0, photo: 2 },
    ];
  }
  // poster + square share the same collage shape
  return [
    { x: -0.03, y: -0.02, w: 1.06, h: 0.64, rot: 0.7, photo: 0 },
    { x: -0.03, y: 0.61, w: 0.52, h: 0.41, rot: -1.0, photo: 1 },
    { x: 0.51, y: 0.61, w: 0.52, h: 0.41, rot: 0.9, photo: 2 },
  ];
}

function drawPhotoCover(ctx, img, px, py, pw, ph, zoom, ox, oy) {
  const iw = img.width || img.naturalWidth;
  const ih = img.height || img.naturalHeight;
  const scale = Math.max(pw / iw, ph / ih) * zoom;
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = px + (pw - dw) / 2 + ox * pw;
  const dy = py + (ph - dh) / 2 + oy * ph;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function gradePanel(ctx, x, y, w, h, grade) {
  const g = ctx.createLinearGradient(x, y, x + w * 0.4, y + h);
  g.addColorStop(0, grade.top + "2e");
  g.addColorStop(0.55, grade.mid + "14");
  g.addColorStop(1, grade.deep + "40");
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  // warm top light
  const top = ctx.createLinearGradient(x, y, x, y + h * 0.35);
  top.addColorStop(0, grade.mid + "26");
  top.addColorStop(1, grade.mid + "00");
  ctx.fillStyle = top;
  ctx.fillRect(x, y, w, h * 0.35);
}

function wrapWords(ctx, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const trial = line ? line + " " + word : word;
    if (ctx.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawTitle(ctx, w, h, caption, tagline, grade) {
  const pad = w * 0.045;
  const maxW = w - pad * 2;
  const base = Math.min(w * 0.115, h * 0.085);
  ctx.save();
  ctx.translate(pad, h * 0.86);
  ctx.rotate(-0.028);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  // fit the caption: shrink until it wraps to at most two lines
  let size = base;
  const setFont = () => {
    ctx.font = `italic 900 ${size}px "Arial Black", "Archivo Black", sans-serif`;
  };
  setFont();
  let lines = wrapWords(ctx, caption.toUpperCase(), maxW);
  while (lines.length > 2 && size > w * 0.05) {
    size *= 0.88;
    setFont();
    lines = wrapWords(ctx, caption.toUpperCase(), maxW);
  }
  const lineH = size * 0.98;
  const totalH = lines.length * lineH;
  const grad = ctx.createLinearGradient(0, -totalH, 0, size * 0.3);
  grad.addColorStop(0, "#fff6c9");
  grad.addColorStop(0.45, "#ffd23e");
  grad.addColorStop(1, "#ff7a1a");
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;
  lines.forEach((line, i) => {
    const y = -totalH + (i + 1) * lineH;
    ctx.shadowColor = "rgba(20, 4, 30, 0.85)";
    ctx.shadowBlur = size * 0.12;
    ctx.shadowOffsetY = size * 0.06;
    ctx.lineWidth = size * 0.16;
    ctx.strokeStyle = "#160a24";
    ctx.strokeText(line, 0, y);
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.fillStyle = grad;
    ctx.fillText(line, 0, y);
    // thin hot highlight along the top of each letter row
    ctx.lineWidth = size * 0.02;
    ctx.strokeStyle = "rgba(255,255,255,0.55)";
    ctx.strokeText(line, 0, y - size * 0.02);
  });
  ctx.restore();

  // tagline, letterspaced caps above the title
  if (tagline) {
    ctx.save();
    ctx.font = `700 ${Math.max(13, w * 0.018)}px "Arial Black", sans-serif`;
    ctx.textAlign = "left";
    const ty = h * 0.86 - totalH - h * 0.028;
    ctx.fillStyle = "rgba(255,255,255,0.92)";
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 8;
    const spaced = tagline.toUpperCase().split("").join("  ");
    ctx.fillText(spaced, pad, ty);
    ctx.restore();
  }
}

function drawGrain(ctx, w, h, seed) {
  const rand = mulberry32(seed ^ 0x9e3779b9);
  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#ffffff";
  const n = Math.floor((w * h) / 2600);
  for (let i = 0; i < n; i++) {
    const s = 1 + rand() * 2;
    ctx.fillRect(rand() * w, rand() * h, s, s);
  }
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = "#000000";
  for (let i = 0; i < n; i++) {
    const s = 1 + rand() * 2;
    ctx.fillRect(rand() * w, rand() * h, s, s);
  }
  ctx.restore();
}

function drawHalftone(ctx, w, h, grade) {
  ctx.save();
  ctx.fillStyle = grade.top;
  ctx.globalAlpha = 0.16;
  const step = Math.max(14, w * 0.014);
  for (let y = h * 0.02; y < h * 0.2; y += step) {
    for (let x = w * 0.78 + (y / h) * w * 0.1; x < w * 0.99; x += step) {
      const r = step * 0.16 * (1 - (y - h * 0.02) / (h * 0.2));
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.6, r), 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(
    w / 2, h / 2, Math.min(w, h) * 0.42,
    w / 2, h / 2, Math.max(w, h) * 0.75,
  );
  g.addColorStop(0, "rgba(10,4,20,0)");
  g.addColorStop(1, "rgba(10,4,20,0.42)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// opts: { sizeKey, caption, tagline, gradeKey, seed, panels: [{image, zoom, ox, oy}] }
// Returns the canvas it painted.
export function renderCover(canvas, opts) {
  const size = SIZES[opts.sizeKey] || SIZES.poster;
  const grade = GRADES[opts.gradeKey] || GRADES.sunset;
  const w = size.w;
  const h = size.h;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  // backdrop: deep grade colour so panel gaps read as design, not holes
  ctx.fillStyle = grade.deep;
  ctx.fillRect(0, 0, w, h);

  const panels = layoutsFor(opts.sizeKey);
  for (const p of panels) {
    const px = p.x * w;
    const py = p.y * h;
    const pw = p.w * w;
    const ph = p.h * h;
    const slot = (opts.panels || [])[p.photo];
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
    ctx.beginPath();
    ctx.rect(0, 0, pw, ph);
    ctx.clip();
    if (slot && slot.image) {
      drawPhotoCover(ctx, slot.image, 0, 0, pw, ph, slot.zoom || 1, slot.ox || 0, slot.oy || 0);
    } else {
      ctx.fillStyle = "#241335";
      ctx.fillRect(0, 0, pw, ph);
    }
    gradePanel(ctx, 0, 0, pw, ph, grade);
    ctx.restore();
    // white keyline + soft drop shadow around the panel
    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.translate(-pw / 2, -ph / 2);
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = w * 0.012;
    ctx.shadowOffsetY = w * 0.004;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(3, w * 0.004);
    ctx.strokeRect(0, 0, pw, ph);
    ctx.restore();
  }

  // scrim behind the title so the lettering always reads
  const scrim = ctx.createLinearGradient(0, h * 0.68, 0, h);
  scrim.addColorStop(0, "rgba(12,4,24,0)");
  scrim.addColorStop(1, "rgba(12,4,24,0.62)");
  ctx.fillStyle = scrim;
  ctx.fillRect(0, h * 0.68, w, h * 0.32);

  drawHalftone(ctx, w, h, grade);
  drawTitle(ctx, w, h, opts.caption || "SUNSET HEIST", opts.tagline || "", grade);
  drawGrain(ctx, w, h, opts.seed || 7);
  drawVignette(ctx, w, h);

  // thin outer frame
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = Math.max(2, w * 0.002);
  ctx.strokeRect(w * 0.012, h * 0.012, w * 0.976, h * 0.976);
  return canvas;
}
