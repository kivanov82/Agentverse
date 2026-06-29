# ShipWithAI — Explainer v7 (the AI-native studio story)

**Status:** RENDERED — `engagements/shipwithai-promo-20260627/video/out/promo-v7.mp4` (127s · 1920×1080 · h264+aac · ~21 MB).
**Output:** a single **~2-min educational explainer**, 1920×1080 landscape — for the site, LinkedIn, email.
**Sound:** licensed music bed (`public/music.mp3`), no voiceover — captions carry it.
**Goal:** a viewer *understands the idea* — not "buy this tool." Teach the AI-native company thesis, show that ShipWithAI is built exactly that way, then prove it with real deliverables.

> **This is an EXPLAINER, not a sizzle.** It supersedes the v1–v3 "20 specialists · 10× faster · three brands" sales cuts (kept in §History). No "terminal tool" framing — the operator has the terminal; the viewer gets the *idea*. Tone is calm and educational: **problem → solution → how → showcase → moat.**

---

## 1. The message (spine)

> In the old world a company **is** its people — they hold the knowledge and do the work. In the new world people move up to **strategy, taste & judgment**, **agents do the labor**, and the company becomes a **shared, legible context layer** that both plug into. ShipWithAI is built exactly like that — and the **moat is legibility**: a delivery operation documented so well that agents can run it. Point that at work repetitive enough to systematize but complex enough that agencies stay slow — and ship.

Built around the **four diagrams** from the founding thesis, each now a purpose-built animated scene:
1. **Remove the maze** — the magic isn't the agent, it's collapsing the workflow (a `maze` before/after).
2. **The org-chart / context layer** — humans → an orchestration agent → specialist teams → a shared context layer that *becomes the company* (a `network`, built in 4 teachable stages).
3. **The readability stack** — you make the business legible, layer by layer (a `stack` pyramid).
4. **The goldmine** — repetitive × complex is the opportunity (a `goldmine` 2×2 map).

**Honesty:** only real outputs on screen. The showcase footage is real runs (a live Vercel store, a real SEO deliverable, a real monitoring cycle that caught a real CVE). No payments are ever shown as live.

---

## 2. The arc (5 acts · what's on screen)

The cut is **data-driven** — `engagements/shipwithai-promo-20260627/video/src/scenes.ts` is the source of truth; total frames are computed from the scene durations (no fixed `durationSeconds`). Current total: **3750 frames = 125s @ 30fps.**

| Act | Beat | Scene type | ~dur | On-screen |
|-----|------|-----------|------|-----------|
| **1 · The shift** | "A company used to be its people." | `message` | 5.5s | the old world |
| | **Remove the maze** (before→after) | `maze` | 12s | *"The magic isn't the agent — it's removing the maze."* |
| | "People move up to strategy, taste & judgment. Agents do the labor." | `message` | 5.5s | the new split |
| **2 · Built like that** | **The company is the context layer** (4-stage build) | `network` | 23s | humans → pm → clusters → shared context layer |
| | **You make the business readable** (pyramid) | `stack` | 11.5s | clean data → … → continuous learning |
| | "The moat is legibility." | `message` | 5s | the thesis |
| **3 · The goldmine** | **Point it at the goldmine** (2×2) | `goldmine` | 11.5s | Repetition × Complexity, goldmine cell = the verticals |
| **4 · The showcase** | "It starts with one brief." | `clip` fleet | 5.5s | the fleet mobilises |
| | "Agents design it." | `clip` claude-design | 7s | Claude Design canvas |
| | "They build the working app." | `clip` app-aether | 7.5s | a live storefront |
| | "And deploy it — automatically." | `clip` deploy | 5.5s | live on Vercel |
| | "They grow what they ship." | `showcase` shot-growth | 5.5s | real SEO + campaign deliverable |
| | "Then watch it — 24/7." | `clip` monitoring | 6.5s | the monitor cycle (uptime · security · traffic) |
| | **"Even this video was made by the agents."** | `montage` | 7.5s | 18 frames of the film fly in as thrown cards → pile → snap into a wall of every scene (*"every scene you just watched — rendered by the fleet"*) |
| **5 · The moat** | **"Strategy stays human."** | `cta` | 8s | *"the rest runs on agents · shipwithai.nl"* |

---

## 3. The scene engine (reusable template)

Lives in `plugins/shipwithai-video/template/src/{Promo.tsx,scenes.ts}` (the engagement copy is a per-run mirror). Scene types, beyond the basics (`title`/`message`/`grid`/`showcase`/`cta`/`stat`):

- **`clip`** — a screen recording in a branded frame: `<OffthreadVideo trimBefore/trimAfter playbackRate>`. `startFrom`/`endAt` (source frames) trim to the highlight; `playbackRate` speeds it up; `heading` is a LARGE title band across the top (scrim); `fit:"contain"` letterboxes ultra-wide sources (terminals) instead of cropping.
- **`network`** — the agent fleet as a hub-and-spoke org chart. `humans` adds a directing bar above the center; `contextLayer` adds a shared-context bar at the base with bidirectional read/write pulses. **`stages` (4 lines) switches it into a cumulative 4-stage build** (humans → +center → +clusters → +contextLayer), each with a crossfading numbered caption — this is what makes it *teach* instead of dropping the whole chart at once.
- **`maze`** — a before/after workflow (two rows of labelled boxes + arrows), scaled to fill the frame. The "remove the maze" beat.
- **`stack`** — a bottom-up pyramid: `layers` given top→bottom (last = widest base), revealed base-first, top layer is the accent apex. The "make the business readable, layer by layer" beat.
- **`goldmine`** — a 2×2 opportunity map (`xAxis` × `yAxis`); three muted quadrants + a highlighted top-right cell holding `items`. Makes "the goldmine" self-explanatory.
- **`montage`** — the wow closer: `images` (stills in `public/`) fly in as "thrown" cards that pile up fast, then morph apart into a wall/contact-sheet of everything made, with the `heading`+`caption` landing on top. Extract frames of the film itself (`ffmpeg -ss <t> -i out/<cut>.mp4 -frames:v 1 -vf scale=960:-2 public/montage/mNN.jpg`) for the meta "every scene you just watched" payoff.

`brand.ts` stays on the studio theme (ink `#1A1A1A` · paper `#F4F1EA` · vermilion `#E4572E` · Newsreader). Music: `public/music.mp3` wired via `brand.music` with a fade.

---

## 4. Assets (real footage + stills)

**Clips** (`public/clips/`, transcoded `.mov → .mp4` via `ffmpeg -i in.mov -vf scale=1920:-2 -r 30 out.mp4`):
- ✅ `fleet.mp4` — the terminal during a multi-agent run
- ✅ `claude-design.mp4` — the claude.ai/design canvas building Aether's screens
- ✅ `app-aether.mp4` — the live Aether storefront (built + deployed)
- ✅ `deploy.mp4` — the Vercel deploy → live URL (**aether-store-fawn.vercel.app**)
- ✅ `monitoring.mp4` — a `/monitor` cycle (the monitors reporting; the run caught a real Next.js CVE → ALERT)

**Stills** (`public/`):
- ✅ `shot-growth.png` — Aether's real **SEO audit & keyword plan** (`/seo` deliverable, rendered via `render-md.mjs` → Playwright screenshot). Campaign deliverable also produced (`engagements/aether-20260627/growth/campaign-plan.md`).
- ✅ `shot-meta.png` — a frame of this very video (the meta-flex).

**How a deliverable still is made:** `node plugins/shipwithai-video/skills/capture-footage/render-md.mjs <in.md> <out.html> "<accent>" "<font>" "<title>"` → serve over localhost (`http-server`, Playwright blocks `file://`) → `browser_navigate` + `browser_resize 1920×1080` + screenshot. Add ~180px body top-padding before shooting if a `clip`/`showcase` `heading` scrim would collide with the document's own title.

---

## 5. Current `scenes.ts` (v6, drop-in)

```ts
export const scenes: Scene[] = [
  // ── ACT 1 · THE SHIFT ──
  { type: "message", durationInFrames: 165, lines: ["A company used to be", "its people.", "They did all the work."] },
  { type: "maze", durationInFrames: 360,
    caption: "The magic isn't the agent — it's removing the maze.",
    before: { label: "Before", steps: ["brief", "emails", "meetings", "specialists", "handoffs", "revisions", "weeks"] },
    after: { label: "After", steps: ["brief", "context layer", "agents", "review", "shipped"] } },
  { type: "message", durationInFrames: 165, lines: ["People move up to", "strategy, taste & judgment.", "Agents do the labor."] },

  // ── ACT 2 · SHIPWITHAI IS BUILT LIKE THAT (the heart) ──
  { type: "network", durationInFrames: 690, heading: "The company is the context layer.",
    center: "pm",
    humans: "Humans · strategy · taste · judgment",
    contextLayer: { label: "Shared context layer", items: ["brief", "brand", "conventions", "playbooks", "decision logs", "memory"] },
    stages: [
      "Humans own the strategy, taste & judgment.",
      "An orchestration agent routes the work.",
      "Specialist agents — grouped by skill — hand tasks to each other.",
      "A shared context layer holds the company's knowledge — and becomes the company.",
    ],
    clusters: [
      { plugin: "web", agents: ["ui-designer", "ui-developer", "e-commerce", "backend", "payments", "deployer", "reviewer"] },
      { plugin: "monitor", agents: ["uptime", "revenue", "traffic", "seo-rank", "security", "reputation"] },
      { plugin: "growth", agents: ["seo", "marketing", "ux-analyst", "tech-writer"] },
      { plugin: "video", agents: ["video-producer"] },
    ] },
  { type: "stack", durationInFrames: 345, heading: "You make the business readable.",
    caption: "Agent leverage isn't a tool you buy — it's your business, made legible, layer by layer.",
    layers: [
      { label: "Continuous learning", sub: "every run sharpens the context" },
      { label: "Human review", sub: "taste & judgment, in the loop" },
      { label: "Agent workflows", sub: "the verticals that do the labor" },
      { label: "Permissions & policies", sub: "what each agent may touch" },
      { label: "Structured knowledge", sub: "briefs · brand · SOPs · decisions" },
      { label: "Clean data", sub: "the foundation everything reads from" },
    ] },
  { type: "message", durationInFrames: 150, lines: ["The moat is", "legibility."] },

  // ── ACT 3 · THE GOLDMINE (the opportunity map) ──
  { type: "goldmine", durationInFrames: 345, heading: "Point it at the goldmine.",
    caption: "Repetitive enough to systematize — complex enough that agencies stay slow and expensive.",
    yAxis: "Repetition", xAxis: "Workflow complexity",
    items: ["Web & e-commerce builds", "SEO & content", "Marketing campaigns", "Marketing videos", "24/7 monitoring", "Smart-contract audits"] },

  // ── ACT 4 · THE SHOWCASE (agents executing on the context layer) ──
  { type: "clip", durationInFrames: 165, src: "clips/fleet.mp4", heading: "It starts with one brief.", caption: "the fleet mobilises", playbackRate: 6, startFrom: 0, fit: "contain" },
  { type: "clip", durationInFrames: 210, src: "clips/claude-design.mp4", heading: "Agents design it.", caption: "Claude Design", playbackRate: 10, startFrom: 0 },
  { type: "clip", durationInFrames: 225, src: "clips/app-aether.mp4", heading: "They build the working app.", caption: "a live storefront", playbackRate: 2, startFrom: 0 },
  { type: "clip", durationInFrames: 165, src: "clips/deploy.mp4", heading: "And deploy it — automatically.", caption: "live on Vercel", playbackRate: 1, startFrom: 0 },
  { type: "showcase", durationInFrames: 165, image: "shot-growth.png", heading: "They grow what they ship.", caption: "SEO + campaigns" },
  { type: "clip", durationInFrames: 195, src: "clips/monitoring.mp4", heading: "Then watch it — 24/7.", caption: "uptime · security · traffic", playbackRate: 2, startFrom: 3800, fit: "contain" },
  { type: "montage", durationInFrames: 225,
    heading: "Even this video was made by the agents.",
    caption: "every scene you just watched — rendered by the fleet",
    images: [ /* montage/m01.jpg … m18.jpg — frames extracted from this cut */ ] },

  // ── ACT 5 · CLOSE (the moat) ──
  { type: "cta", durationInFrames: 240, title: "Strategy stays human.", subtitle: "the rest runs on agents · shipwithai.nl" },
];
```

---

## 6. Render & iterate

```bash
cd engagements/shipwithai-promo-20260627/video
npx tsc --noEmit                                  # validate scenes against Promo.tsx
npx remotion still Promo out/_t.png --frame=<n>   # eyeball a beat (Read the PNG)
npx remotion render Promo out/promo-v6.mp4        # full render (~70s wall)
```

Iterate by reading stills at each beat's midpoint before a full render. Frame offsets (cumulative): maze ~300 · network stages ~766/918/1083/1276 · stack ~1600 · goldmine ~2150 · growth ~3065.

---

## 7. Notes & open polish

- **Monitor clip** (`startFrom: 3800`) lands on the monitors reporting (incl. the real CVE ALERT) rather than the final digest table — readable and on-message; re-trim `startFrom` if a cleaner digest frame is wanted.
- **Network "WEB" label** sits slightly under the Humans pill's right edge (original cluster geometry) — cosmetic.
- **Honesty:** Stripe never shown as a live charge; the stats/claims are real runs only.
- **9:16 cut** (optional, later): same scenes at 1080×1920, re-stack the clip frames vertically.
- **Next:** this same engine + positioning feeds the **shipwithai.nl** rebuild (Claude Design).

---

## History

- **v1** — 30s stills-only cut (`engagements/shipwithai-promo-20260626/`).
- **v2–v3** — 75s "sizzle": *"A full software studio · 20 specialists · One terminal · 10× faster"* across three brands (Aether/Evergreen/Meridian). Sales-led; superseded when the studio repositioned to the **AI-native / legibility** thesis (the "terminal tool" framing was explicitly dropped).
- **v4–v5** — first educational recuts (overview → use cases → showcase); introduced the `network`/`list`/`maze` scenes.
- **v6** — the thesis arc with purpose-built diagram scenes (maze · staged network · stack · goldmine), a real growth deliverable still, and music. 125s.
- **v7** — *(this doc)* + the `montage` wow closer (the film's own scenes thrown into a wall) replacing the flat meta still. 127s.
