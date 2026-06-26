# ShipWithAI — Promo v2 (production plan & script)

**Status:** DRAFT — do not render yet. Footage gets recorded as we run each vertical; we assemble at the end.
**Format:** 1920×1080 (landscape, for site hero / LinkedIn / email). Optional 9:16 cut later.
**Target length:** ~75s — LOCKED (sizzle, captions + music, no voiceover).
**Goal:** a prospect walks away convinced of (a) possibilities, (b) speed, (c) professionalism.
**Sound:** licensed music bed (drop `.mp3` in `public/`), no voiceover (captions carry it). VO is an option if we want it.

---

## 1. The message (spine)

> A traditional agency needs weeks and a room full of specialists. ShipWithAI **is** that room — 14 AI specialists working in parallel in one terminal — that designs, builds, audits, and launches your product in an afternoon.

Three beats the whole film must land: **possibilities** (it does the whole SDLC), **speed** (afternoon vs weeks), **professionalism** (real, verified, on-brand deliverables).

### Headline claim — CHOSEN: **B — Scale**
> "A full software studio. **14 specialists. One terminal. 10× faster.**"

(Unfolds across scenes 1–3, echoed in the payoff scene 10. Alternatives considered: A "What an agency ships in a month, a fleet ships in an afternoon."; C "Brief in. Product out. Designed, built, audited, launched — by AI.")

### Real stats to feature (verified — keep honest)
- 14 specialist agents · 8 skills · 5 use-cases · 6 connected tools
- 2,608 lines of audit methodology (Feynman · Nemesis · State-Inconsistency)
- Every audit finding proven with a passing Foundry PoC

---

## 2. Storyboard (scene-by-scene)

Legend — **MG** = motion graphics (Remotion, no capture needed) · **REC** = real screen recording (capture required) · **SHOT** = static screenshot of a deliverable.

| # | t (s) | Type | Visual | On-screen copy | Capture source |
|---|------|------|--------|----------------|----------------|
| 1 | 0–4 | MG | Title card, brand rule animates in | "A full software studio." | — (have it) |
| 2 | 4–9 | MG | Bold type, lines build | "14 specialists. One terminal." | — |
| 3 | 9–15 | MG | Animated counters + agent grid → tagline | "14 specialists · 8 skills · 5 use-cases" (count up) → "10× faster." | — (real numbers) |
| 4 | 15–25 | **REC** | Terminal: brief in → PM hands off → subagents fan out (the `/workflows` progress tree is ideal) | "One brief. The whole team mobilises — in parallel." | **Record:** a multi-agent run (`/ecommerce` or the `/audit` full workflow) showing handoffs / parallel subagents |
| 5 | — | *DEFERRED* | Claude Design → Figma (Figma skipped for now). Re-add if/when Figma is connected; until then this time folds into scenes 6–7. | "Design — straight into Figma." (deferred) | **Deferred:** needs Figma connected |
| 6 | 34–43 | **REC** | Terminal building + browser opens the live storefront, fast-forward | "Built, wired, running — in minutes." | **Record:** `/ecommerce` build + the store in a browser (dev server / Playwright) |
| 7 | 43–52 | **REC → SHOT** | `/audit` workflow running + PoC tests passing → cut to the report card | "Audited — every finding proven with a test." | **Record:** `/audit` full run (workflow tree + `forge test` passing). Report card SHOT already exists |
| 8 | 52–59 | **SHOT** | SEO report + campaign assets slide in | "SEO, content, campaigns — ready to publish." | **Capture:** `/seo` + `/campaign` deliverables (HTML→screenshot) |
| 9 | 59–67 | **SHOT** | Deliverables montage: audit · store · SEO · campaign · video | "Real deliverables. On brand. Production-grade." | the above stills + a frame of this video (meta) |
| 10 | 67–71 | MG | Big payoff line, accent sweep | "10× faster. A fraction of the cost." | — |
| 11 | 71–75 | MG | CTA card | "ShipWithAI · shipwithai.nl" / small: "Even this video was made by the studio." | — (have CTA scene) |

**Meta-flex (scene 11 subtitle):** calling out that the studio produced its own promo is a strong professionalism beat — keep it.

---

## 3. Capture checklist (record as we build each use-case)

Record at **1920×1080** (or 2× and downscale), large terminal font, clean prompt, no secrets on screen. Record at **normal speed** — we fast-forward in Remotion, not at capture time (keeps it smooth). Save to `engagements/shipwithai-promo-<date>/clips/`.

- [ ] **C1 — Fleet / parallel subagents** (scene 4). During a multi-agent run, screen-record the terminal. Best visual: the `/workflows` live progress tree, or PM `request_handoff` → `agent_start` events. ~30–60s raw.
- [ ] **C2 — Claude Design code→design** (scene 5) — **DEFERRED** (Figma skipped for now). The designer still works in-code during `/ecommerce`; capture the Figma round-trip later only if Figma gets connected.
- [ ] **C3 — Build + live store** (scene 6). During `/ecommerce` build: record the terminal building, then the **browser** loading the storefront (scroll the homepage + a product page). ~30s raw.
- [ ] **C4 — Audit run** (scene 7). Record a `/audit` full run: the workflow tree + a `forge test` pass scrolling by. ~30–60s raw. (Report card SHOT done.)
- [ ] **C5 — Growth deliverables** (scene 8). After `/seo` + `/campaign`, render their `.md` deliverables to branded HTML and screenshot (same method as the audit card).
- [ ] **C6 — Deliverables stills** (scene 9). Collect best stills: audit card ✅, store homepage, SEO report, campaign asset, a promo frame.

**How to record (macOS):** `Cmd+Shift+5` → record selected window/region → save `.mov`. Or `screencapture -v -R <x,y,w,h> clip.mov` for a scripted region. Transcode if needed: `ffmpeg -i clip.mov -vf scale=1920:-2 -r 30 clip.mp4`.

---

## 4. Technical: bringing recordings into Remotion (template work, do later)

The current template only does stills. To use screen recordings we add to `plugins/shipwithai-video/template`:

1. **New scene type `clip`** in `scenes.ts`:
   ```ts
   { type: "clip"; durationInFrames: number; src: string; caption: string; playbackRate?: number; startFrom?: number }
   ```
   Rendered in `Promo.tsx` with Remotion's `<OffthreadVideo src={staticFile(src)} playbackRate={4} startFrom={...} />` inside a branded frame, caption overlaid. `playbackRate` = the fast-forward; `startFrom`/`endAt` trims to the good moment.
2. **New scene type `stat`** (optional): animated counting numbers for scene 3 (more impressive than static labels) — `interpolate(frame, [...], [0, 14])` rounded.
3. Recordings live in `public/clips/`. Keep each clip trimmed to its highlight before import (smaller files, tighter cut).
4. Music: `<Audio src={staticFile("music.mp3")} />` at the composition root, volume ducked.

These are ~1 file of React changes; we'll add them once C1–C6 footage exists.

---

## 5. Build/record order (how this unfolds)

1. **Activate plugins** (reload → trust/install), then **you run `/ecommerce`** while recording. Store subject: **ShipWithAI merch** (on-brand demo store). Figma step **skipped** for now. → capture **C1** (fleet) + **C3** (build/store) + a store SHOT. (C2/Figma deferred.)
2. Re-run `/audit` (or capture from a fresh run) → **C4**.
3. Run `/seo` + `/campaign` → **C5** deliverables.
4. Extend the Remotion template (clip + stat scene types).
5. Assemble `scenes.ts` against the real footage, drop clips/stills in `public/`, render.
6. Add music, review pacing/legibility, final render.

> ✅ Decided: claim **B (Scale)**, length **~75s**, captions + music, no VO. Next: start the capture runs — begin with `/ecommerce` (yields C1 fleet + C2 Claude Design + C3 build/store).
