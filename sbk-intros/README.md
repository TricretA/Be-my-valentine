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
