// samples.js — procedural "photo" scenes drawn entirely in code.
// These stand in for a person's photo so the app works with zero uploads:
// a neon sunset skyline, a dusk pier, and a night street. Every pixel is
// painted here with the canvas 2D API; nothing is loaded from a file.
// Deterministic: the same scene id and seed always paint the same picture.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SCENES = [
  { id: "skyline", name: "Neon Skyline", seed: 11 },
  { id: "pier", name: "Dusk Pier", seed: 23 },
  { id: "street", name: "Night Street", seed: 37 },
];

function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sunDisc(ctx, x, y, r, core, glow) {
  const g = ctx.createRadialGradient(x, y, r * 0.1, x, y, r * 3.2);
  g.addColorStop(0, glow);
  g.addColorStop(0.35, glow + "55");
  g.addColorStop(1, glow + "00");
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function palm(ctx, x, y, s, lean, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(lean);
  ctx.scale(s, s);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, -70, 6, -140);
  ctx.stroke();
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI * (0.08 + i * 0.13);
    const len = 62 - i * 4;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(6, -140);
    ctx.quadraticCurveTo(
      6 + Math.cos(a) * len * 0.6,
      -140 + Math.sin(a) * len * 0.45 - 18,
      6 + Math.cos(a) * len,
      -140 + Math.sin(a) * len + 26,
    );
    ctx.stroke();
  }
  ctx.restore();
}

function buildingRow(ctx, w, h, base, rand, palette) {
  let x = -20;
  while (x < w + 20) {
    const bw = 60 + rand() * 130;
    const bh = h * (0.18 + rand() * 0.38);
    const top = base - bh;
    ctx.fillStyle = palette[Math.floor(rand() * palette.length)];
    ctx.fillRect(x, top, bw, bh);
    // lit windows
    ctx.fillStyle = "#ffd76a";
    for (let wy = top + 14; wy < base - 12; wy += 26) {
      for (let wx = x + 10; wx < x + bw - 12; wx += 24) {
        if (rand() < 0.42) ctx.fillRect(wx, wy, 10, 13);
      }
    }
    x += bw + 6 + rand() * 22;
  }
}

function neonSign(ctx, x, y, text, color, size) {
  ctx.save();
  ctx.font = `900 ${size}px "Arial Black", sans-serif`;
  ctx.textAlign = "center";
  ctx.shadowColor = color;
  ctx.shadowBlur = 22;
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.shadowBlur = 6;
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.85;
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSkyline(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  skyGradient(ctx, w, h, [
    [0, "#1b0f3a"],
    [0.42, "#7b1e63"],
    [0.68, "#ff5e62"],
    [0.85, "#ff9e4f"],
    [1, "#ffc46b"],
  ]);
  // far skyline
  buildingRow(ctx, w, h, h * 0.86, rand, ["#2a1245", "#34164f", "#241038"]);
  // sun sits above the far skyline so it reads against the sky
  sunDisc(ctx, w * 0.68, h * 0.44, h * 0.11, "#fff3c4", "#ff9e4f");
  // near skyline
  buildingRow(ctx, w, h, h * 0.97, rand, ["#150a26", "#1c0d33", "#100722"]);
  // foreground palms
  palm(ctx, w * 0.08, h * 1.0, h / 260, -0.1, "#0a0518");
  palm(ctx, w * 0.94, h * 1.02, h / 300, 0.14, "#0a0518");
  // street glow at the bottom
  const g = ctx.createLinearGradient(0, h * 0.86, 0, h);
  g.addColorStop(0, "#ff5e6200");
  g.addColorStop(1, "#ff5e6244");
  ctx.fillStyle = g;
  ctx.fillRect(0, h * 0.86, w, h * 0.14);
}

function drawPier(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  skyGradient(ctx, w, h, [
    [0, "#0f1e4a"],
    [0.45, "#b83b7a"],
    [0.7, "#ff7e5f"],
    [1, "#feb47b"],
  ]);
  sunDisc(ctx, w * 0.5, h * 0.56, h * 0.13, "#fff0b8", "#ff7e5f");
  // sun path on the water
  const horizon = h * 0.62;
  ctx.fillStyle = "#2a1a4e";
  ctx.fillRect(0, horizon, w, h - horizon);
  for (let i = 0; i < 46; i++) {
    const y = horizon + 8 + rand() * (h - horizon - 16);
    const spread = (y - horizon) / (h - horizon);
    const ww = 60 + spread * 320;
    ctx.fillStyle = `rgba(255, 190, 110, ${0.5 - spread * 0.35})`;
    ctx.fillRect(w * 0.5 - ww / 2 + (rand() - 0.5) * 40, y, ww, 3);
  }
  // pier deck and posts
  ctx.fillStyle = "#1a0f2e";
  ctx.beginPath();
  ctx.moveTo(w * 0.42, horizon);
  ctx.lineTo(w * 0.58, horizon);
  ctx.lineTo(w * 0.72, h);
  ctx.lineTo(w * 0.28, h);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#241640";
  for (let i = 0; i < 7; i++) {
    const t = i / 6;
    const y = horizon + t * (h - horizon);
    const x = w * 0.5 + (t - 0.5) * w * 0.34;
    ctx.fillRect(x - 5 - t * 8, y, 10 + t * 16, 4 + t * 6);
  }
  // string lights along the pier
  for (let i = 0; i < 12; i++) {
    const t = i / 11;
    const x = w * 0.5 + (t - 0.5) * w * 0.4;
    const y = horizon + 6 + t * (h - horizon) * 0.28;
    ctx.fillStyle = i % 2 ? "#ff5e9c" : "#ffd76a";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(x, y, 3 + t * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  palm(ctx, w * 0.05, h * 0.66, h / 320, -0.12, "#0d0620");
  palm(ctx, w * 0.96, h * 0.68, h / 340, 0.1, "#0d0620");
}

function drawStreet(ctx, w, h, seed) {
  const rand = mulberry32(seed);
  skyGradient(ctx, w, h, [
    [0, "#070313"],
    [0.5, "#1c0b38"],
    [0.78, "#57204f"],
    [1, "#8a2f5e"],
  ]);
  // wet street
  ctx.fillStyle = "#12081f";
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  // buildings first, so the neon signs sit on top of them
  buildingRow(ctx, w, h, h * 0.66, rand, ["#0d0618", "#140a24", "#0a0414"]);
  // neon signs
  neonSign(ctx, w * 0.22, h * 0.3, "VICE", "#ff2e88", h * 0.16);
  neonSign(ctx, w * 0.78, h * 0.22, "24H", "#22d3ee", h * 0.11);
  neonSign(ctx, w * 0.74, h * 0.44, "OCEAN", "#a3e635", h * 0.09);
  // car silhouette with headlights
  const cy = h * 0.78;
  ctx.fillStyle = "#05030a";
  ctx.beginPath();
  ctx.moveTo(w * 0.2, cy);
  ctx.lineTo(w * 0.26, cy - h * 0.07);
  ctx.lineTo(w * 0.42, cy - h * 0.09);
  ctx.lineTo(w * 0.62, cy - h * 0.08);
  ctx.lineTo(w * 0.78, cy - h * 0.02);
  ctx.lineTo(w * 0.8, cy + h * 0.02);
  ctx.lineTo(w * 0.2, cy + h * 0.02);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#1a0f2e";
  ctx.beginPath();
  ctx.arc(w * 0.32, cy + h * 0.02, h * 0.035, 0, Math.PI * 2);
  ctx.arc(w * 0.66, cy + h * 0.02, h * 0.035, 0, Math.PI * 2);
  ctx.fill();
  // headlight beams
  const beam = ctx.createLinearGradient(w * 0.8, cy, w, cy + h * 0.06);
  beam.addColorStop(0, "rgba(255, 240, 180, 0.55)");
  beam.addColorStop(1, "rgba(255, 240, 180, 0)");
  ctx.fillStyle = beam;
  ctx.beginPath();
  ctx.moveTo(w * 0.8, cy - h * 0.01);
  ctx.lineTo(w, cy - h * 0.05);
  ctx.lineTo(w, cy + h * 0.1);
  ctx.lineTo(w * 0.8, cy + h * 0.02);
  ctx.closePath();
  ctx.fill();
  // reflections on the wet road
  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = `rgba(${180 + rand() * 75}, ${40 + rand() * 60}, ${140 + rand() * 80}, ${0.12 + rand() * 0.2})`;
    const rw = 20 + rand() * 90;
    ctx.fillRect(rand() * w, h * 0.66 + rand() * h * 0.3, rw, 2 + rand() * 3);
  }
  palm(ctx, w * 0.06, h * 0.64, h / 300, -0.08, "#05030a");
}

// Paint one scene onto a fresh canvas and return it.
export function paintScene(sceneId, width = 1080, height = 1080) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  const scene = SCENES.find((s) => s.id === sceneId) || SCENES[0];
  if (scene.id === "pier") drawPier(ctx, width, height, scene.seed);
  else if (scene.id === "street") drawStreet(ctx, width, height, scene.seed);
  else drawSkyline(ctx, width, height, scene.seed);
  return canvas;
}
