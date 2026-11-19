// shots.js — deterministic screenshot scenes for the app itself.
// ?shot=cover  renders one exported cover full-bleed (no editor chrome).
// ?shot=editor renders the editor with a sample photo loaded.
// Query params: size (wide|poster|square|story), grade, caption, tagline,
// scene (skyline|pier|street). When a scene finishes painting, the page
// sets window.__shotReady = true so a screenshot script can wait on it.

import { renderCover } from "./cover.js";
import { paintScene } from "./samples.js";

export function readShotParams() {
  const q = new URLSearchParams(location.search);
  return {
    shot: q.get("shot") || "",
    sizeKey: q.get("size") || "poster",
    gradeKey: q.get("grade") || "sunset",
    caption: q.get("caption") || "SUNSET HEIST",
    tagline: q.get("tagline") || "A VICE CITY STORY",
    scene: q.get("scene") || "skyline",
  };
}

export function defaultPanels(sceneId) {
  const scenes = ["skyline", "pier", "street"];
  const order = [sceneId, ...scenes.filter((s) => s !== sceneId)];
  return order.map((id) => ({ image: paintScene(id, 1080, 1080), zoom: 1.05, ox: 0, oy: 0 }));
}

// Full-bleed cover scene: hides the editor, paints the cover to fill the
// viewport, and flags readiness.
export function runCoverShot(params) {
  document.body.classList.add("shot-cover");
  const canvas = document.getElementById("cover");
  const panels = defaultPanels(params.scene);
  renderCover(canvas, {
    sizeKey: params.sizeKey,
    caption: params.caption,
    tagline: params.tagline,
    gradeKey: params.gradeKey,
    seed: 7,
    panels,
  });
  window.__shotReady = true;
  return panels;
}
