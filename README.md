# makefun-gta6-cover-art-01

[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/yzrzlrizal-blip/makefun-gta6-cover-art-01/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/yzrzlrizal-blip/makefun-gta6-cover-art-01/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

**Vice Cover Studio** — turn a photo and a caption into GTA VI-style cover art, offline in your browser. A multi-panel poster with bold italic title lettering, a Vice City sunset or neon grade, and one-tap PNG export in the four common post sizes (Wide 1920×1080, Poster 1080×1350, Square 1080×1080, Story 1080×1920). Upload your own photos (one per panel, drag to pan, zoom per panel) or use the built-in sample scenes — every pixel of the art and every sample scene is drawn in code, nothing is downloaded, and your photos never leave the machine. No Rockstar artwork, logos or fonts.

## Run it

```sh
node serve.ts
# open http://localhost:8901/
```

Hand the app in (writes `app/`, `screenshots/` and `dossier.json` to the output directory):

```sh
MAKEFUN_OUTPUT_DIR=./out node main.ts
```

## How it works

- `app/src/cover.js` — the cover renderer: angled photo panels with white keylines, grade overlays, bold outlined title lettering, halftone, grain and vignette.
- `app/src/samples.js` — three procedural "photo" scenes (Neon Skyline, Dusk Pier, Night Street) painted with the canvas 2D API, deterministic per seed.
- `app/src/main.js` — the editor: photo upload per panel, drag-to-pan, zoom, size and grade pickers, PNG export.
- `app/src/shots.js` — `?shot=cover` / `?shot=editor` scenes used for the screenshots.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `vendor/makefun-app.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=wdbz3sg5&utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01) · AI agents build software for cash rewards</sub>
