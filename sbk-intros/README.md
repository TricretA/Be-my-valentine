# SBK MEDIA TV – Intros (Remotion)

## Programme intros (30fps, 10s)
`npm run render:wisdom` / `render:story` / `render:homeboys` -> `out/*.mp4`

## SBK MEDIA TV channel intro (60fps, 10s) – `SBKIntro`
After-Effects-style logo animation built from a **vector trace of the client's logo**.

    npx remotion render src/index.ts SBKIntro out/SBK-MEDIA-TV-intro.mp4 --concurrency=3 --timeout=240000
    npm run studio          # live preview / tweak timings

Pipeline
| step | file |
|---|---|
| logo JPG -> transparent PNGs (mark + wordmark) | `tools/prep_assets.py` |
| logo -> separate SVG paths (S top, S bottom, mic grille bars, mic capsule) via potrace | `tools/vectorize_logo.py` -> `src/logoPaths.ts` |
| original sound design + spectrum per frame (drives the audio-reactive bars) | `tools/make_brand_audio.py` -> `public/audio/sbk-intro.wav`, `public/data/spectrum.json` |
| animation (timeline documented at top of file) | `src/SBKIntro.tsx` |
| quick preview stills | `node tools/stills.mjs SBKIntro out/sbk 100,146,300` |

Re-run order if the logo changes: `prep_assets.py` -> `vectorize_logo.py` -> `make_brand_audio.py` -> render.

---
# How to edit & re-render (simple guide)

**One-time setup** (on any computer with Node.js 18+ and ffmpeg): open a terminal in the `sbk-intros` folder and run `npm install`.

**1. Change the words**
- Channel intro tagline: open `src/SBKIntro.tsx`, find the box at the top called `EDIT HERE`, change the text in `TAGLINE` (keep it in CAPITALS, one item per line that slides in).
- Programme intro titles/taglines: open `src/WisdomChronicles.tsx`, `src/StoryHour.tsx` or `src/HomeboysPodcast.tsx` and edit the text inside the quotes.

**2. Preview it live (optional)** – run `npm run studio`; a browser opens where you can scrub the video and see your change instantly.

**3. Re-render the video**
- Channel intro: `npx remotion render src/index.ts SBKIntro out/SBK-MEDIA-TV-intro.mp4 --concurrency=3 --timeout=240000`
- Wisdom Chronicles: `npm run render:wisdom`
- Story Hour: `npm run render:story`
- Homeboys Podcast: `npm run render:homeboys`

The finished MP4 appears in the `out` folder.

**Changing colours:** `ORANGE`, `CREAM`/`BG` and `BLACK`/`INK` are defined at the top of `src/brand.tsx` and `src/SBKIntro.tsx`.
**Changing the logo:** replace `public/mark.jpg` and `public/logo-full.jpg`, then run `python3 tools/prep_assets.py && python3 tools/vectorize_logo.py` and re-render.
**Changing the sound:** edit `tools/make_brand_audio.py`, run `python3 tools/make_brand_audio.py`, re-render.
