---
name: remotion-compose
description: Scaffold and render a branded video with Remotion from the bundled template. Use after footage is captured — copy the template into the engagement, fill the brand + scenes config, drop assets into public/, and render to MP4. Covers the scene types and the render command.
allowed-tools: Read, Write, Edit, Bash
---

# Remotion Compose

Turn a brief + captured footage into a rendered MP4 using the studio's bundled Remotion template. The template keeps the React fixed; you customize **data** (brand + scenes), not the rendering code.

## Steps

1. **Copy the template** into the engagement:
   ```
   cp -R ${CLAUDE_PLUGIN_ROOT}/template engagements/<slug>/video
   cd engagements/<slug>/video && npm install
   ```
   (First `npm install` pulls Remotion + its bundled ffmpeg. Allow a minute.)

2. **Fill the brand** — edit `src/brand.ts`:
   ```ts
   export const brand = {
     name: "ShipWithAI",
     tagline: "An AI studio that ships.",
     accent: "#E4572E",   // from brand-extract, else studio vermilion
     ink: "#1A1A1A",
     paper: "#F4F1EA",
     font: "Newsreader",
     logo: "logo.png",     // a file in public/, or null
     fps: 30,
     durationSeconds: 30,   // match the chosen length
   };
   ```

3. **Author the scenes** — edit `src/scenes.ts`. Each scene has a `type` and `durationInFrames`. Available types:
   - `{ type: "title", title, subtitle }` — logo + name + tagline card.
   - `{ type: "message", lines: string[] }` — big animated statement (e.g. "An AI studio that ships").
   - `{ type: "grid", items: string[] }` — animated grid of labels (the agent fleet / the verticals).
   - `{ type: "showcase", image, caption }` — a captured screenshot scaling/sliding in with a caption. `image` is a filename in `public/`.
   - `{ type: "clip", src, caption, playbackRate?, startFrom?, endAt?, muted? }` — a **screen recording** (mp4/webm in `public/`) inside a branded frame, fast-forwarded. `playbackRate` (default 4) is the speed-up; `startFrom`/`endAt` (frames of the SOURCE) trim to the highlight. This is how terminal runs, the Claude Design canvas, and live storefronts get in.
   - `{ type: "stat", stats: [{ value, label, suffix? }], tagline? }` — **animated counters** that count up from 0 (e.g. 14 specialists · 8 skills · 5 verticals → "10× faster.").
   - `{ type: "cta", title, subtitle }` — closing card with the domain + an accent sweep.
   Keep ~2.5–4s per caption; total of all `durationInFrames` should equal `fps * durationSeconds`.

4. **Drop assets** — copy captured stills into `engagements/<slug>/video/public/` with the names referenced by `showcase` scenes (and the logo).

5. **Render**:
   ```
   npx remotion render Promo out/promo.mp4
   ```
   Output: `engagements/<slug>/video/out/promo.mp4` (1920×1080, H.264).
   To preview interactively instead: `npm run start` (Remotion Studio).

6. **Review** — open the MP4. Check pacing, caption legibility/contrast, brand consistency, and safe margins. Adjust `scenes.ts` durations/text and re-render as needed.

## Notes

- **Screen recordings** (`clip` scenes): drop the `.mp4`/`.webm` into `public/` (a `public/clips/` subfolder keeps it tidy — reference as `clips/name.mp4`). Trim each recording to its highlight before import, or use `startFrom`/`endAt`. Transcode `.mov` → `.mp4` with `ffmpeg -i clip.mov -vf scale=1920:-2 -r 30 clip.mp4`.
- Music: drop an `.mp3` into `public/` and add `<Audio>` per the template's commented example, or leave silent.
- If `npm install` is slow or offline, `npx remotion render` still works once deps are present.
- Don't fabricate metrics in captions — only state what the deliverables actually show.
