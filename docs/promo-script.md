# ShipWithAI — Promo v3 (production plan & exact script)

**Status:** READY — every tooling prerequisite is built; only footage + music remain (both need an operator at the keyboard). Supersedes v1 (a 30s stills-only cut, rendered at `engagements/shipwithai-promo-20260626/`) and the v2 draft.
**Output:** a single **~75s sizzle** (LOCKED), 1920×1080 landscape — for the site hero, LinkedIn, email.
**Sound:** licensed music bed (drop `.mp3` in `public/`), no voiceover — captions carry it.
**Goal:** a prospect walks away convinced of (a) **range** (any brand, any audience), (b) **speed** (afternoon vs weeks), (c) **professionalism** (real, verified, on-brand deliverables).

The film is produced by running the studio for real across **three contrasting brands**, recording as we go, then cutting the footage to 75s. The walkthrough doubles as a delivery-proof: if we can film it, we can ship it.

---

## 1. The message (spine)

> A traditional agency needs weeks and a room full of specialists. ShipWithAI **is** that room — running locally in one terminal — that designs, builds, audits, and launches your product in an afternoon, then **keeps watching it 24/7** after go-live. We prove it by building three completely different brands at once.

**Headline claim — B (Scale):** *"A full software studio. 20 specialists. One terminal. 10× faster."* (unfolds across scenes 1–3, echoed in the payoff).

**Honest stats (verified 2026-06-28 — keep honest):**
- **20** specialist agents · **12** skills · **6** verticals · connected to Claude Design, Playwright, Vercel, Stripe, GitHub
- **2,539** lines of audit methodology (Feynman 973 · Nemesis 1,048 · State-Inconsistency 518)
- Every audit finding proven with a passing Foundry PoC
- Three storefronts designed, built, and wired in a single run
- And it doesn't stop at launch — **24/7 monitoring agents** watch tech, sales & traffic after go-live

---

## 2. The three brands (the range triangle)

Three deliberately different briefs so the design system visibly adapts to audience. Names are placeholders — swap freely.

### Brand 1 — **Aether** · smart-home  *(the DEEP brand — also gets SEO + campaign)*
- **Sells:** smart-home sensors, hubs, automation kits. Tagline: *"Your home, aware."*
- **Audience:** tech-forward, 25–45.
- **Aesthetic:** futuristic / electric. Dark UI, near-black canvas, electric-teal accent, glass panels, subtle grid, motion-forward.
- **Type:** Space Grotesk (display) + JetBrains Mono (specs/prices). **Palette:** ink `#0B0F12`, surface `#11181D`, accent `#15C2A5`, paper `#E8F1EE`.
- **Screens:** home (hero + product grid), product (a sensor kit), cart, checkout.

### Brand 2 — **Evergreen** · made-for-ease  *(built + checkout)*
- **Sells:** wellbeing / mobility / gardening for 60+ — ergonomic garden tools, easy-grip kitchenware, mobility aids. Tagline: *"Comfort, delivered."*
- **Audience:** 60+. Accessibility is the design thesis.
- **Aesthetic:** warm & accessible. Large legible type, very high contrast, generous spacing, visible trust badges, a prominent **"Call to order"** phone CTA next to every add-to-cart, simple flat nav.
- **Type:** Fraunces (display) + Source Sans 3 at large sizes (body ≥ 20px). **Palette:** paper `#FBF7EE`, ink `#22302A`, accent forest `#2F6B4F`, warm `#C2552E`.
- **Screens:** home (big hero, large cards), product (huge type, big add-to-cart), checkout (one simple page).

### Brand 3 — **Meridian** · advisory  *(built + booking, NOT a cart)*
- **Sells:** boutique financial advisory / wealth consultancy. CTA is **"Book a consultation,"** not checkout — proves the studio does lead-gen sites, not only carts.
- **Audience:** institutional / HNW, premium B2B.
- **Aesthetic:** premium / institutional. Navy + bone, serif, restrained, fine rules, lots of whitespace, credibility cues (stats, logos, team).
- **Type:** Newsreader (display serif) + a grotesque for labels. **Palette:** navy `#0E1B2C`, bone `#F2EFE9`, muted gold `#B08D57`.
- **Screens:** home (hero + services + insights), services, **book-a-consultation** (calendar/lead form).

---

## 3. The pipeline (what runs, who does it, what it produces)

Run with `/ecommerce` per brand (one `engagements/<brand>-<date>/` each), then `/seo` + `/campaign` + `/audit` for the deep/breadth beats. Every step names an agent + a deliverable (the captions).

| Step | Agent(s) | Brands | Deliverable (named on screen) |
|------|----------|--------|-------------------------------|
| Intake | `pm` + `intake` | all 3 | normalized briefs |
| **Design** | `ui-designer` + `claude-design` skill | all 3 | logo + style book + screens (Claude Design canvas → export) |
| Build | `ui-developer` | all 3 | running storefront ×3 |
| Catalog/cart | `e-commerce-specialist` | Aether, Evergreen | product model + cart |
| **Commerce** | `payment-integration` | Aether, Evergreen = **Stripe checkout** (test mode); Meridian = **book-a-call** lead form | live checkout / booking |
| SEO | `seo-specialist` + `tech-writer` | **Aether only** | `seo-report.md` + content plan |
| Campaign | `marketing` + `tech-writer` | **Aether only** | `campaign-plan.md` + `copy/*` |
| Breadth: Audit | `solidity-auditor` | (existing vault) | severity report + Foundry PoC |
| **After launch: Monitor** | `uptime-sentinel` + `revenue-analyst` + `traffic-analyst` (+seo/security/reputation) | **Aether** | 24/7 digest + alerts (tech · sales · traffic) |
| Meta: Video | `video-producer` | the studio | *this film* |

**Commerce note:** Stripe is the connected payment rail (Shopify is **not** wired — don't promise it). Use Stripe **test mode** only; never show live keys or real card data on screen.

---

## 4. Recording shot list — *what to record, and when*

Record at **1920×1080** (or 2× and downscale), large terminal font, clean prompt, **no secrets/keys on screen**, normal speed (we fast-forward in Remotion). Save every recording into `engagements/shipwithai-promo-20260627/clips/` and transcode `.mov → .mp4` (`ffmpeg -i in.mov -vf scale=1920:-2 -r 30 out.mp4`). macOS capture: `Cmd+Shift+5` → record window/region.

| Tag | Record this | When (during which run) | Raw len | Feeds scene |
|-----|-------------|--------------------------|---------|-------------|
| **R1 — fleet** | The terminal during a multi-agent run — ideally the `/workflows` progress tree, or PM handoffs / subagents fanning out | the `/audit --depth full` workflow, or any `/ecommerce` run | 30–60s | 4 |
| **R2 — Claude Design** (hero) | The **claude.ai/design** canvas building screens from the imported repo — chat-left/canvas-right, screens appearing, a logo/style-book forming | during the design step (after `claude-design` pushes each brand's repo) | 40–80s | 5 |
| **R3 — storefronts** | Browser scrolling each **running** store: homepage → a product page. One recording per brand | after each `/ecommerce` build (`npm run dev`) | 3×~10s | 6, 7, 8 |
| **R4 — checkout** | Stripe **test-mode** checkout on Aether (or Evergreen): cart → checkout → success | after `payment-integration` | 10–20s | 9 |
| **R6 — audit test** | `forge test` passing, scrolling green; optionally the workflow tree | during/after the `/audit` run | 10–20s | 12 |
| **R7 — monitoring** | The `/monitor` check cycle in the terminal **+** a notification firing (push/Slack) and the digest. No live data yet? Render the digest md → branded HTML for a clean "dashboard" still instead | after `/monitor` on Aether | 10–20s | 14 |

**Stills (no recording — generated):**
- **S-SEO / S-CAMPAIGN** (scenes 10, 11): render Aether's `seo-report.md` and a `copy/*.md` to branded HTML with `render-md.mjs`, serve over localhost, Playwright screenshot → `shots/shot-seo.png`, `shot-campaign.png`.
- **S-AUDIT** (scene 13): already have `shot-audit-report.png` (copy from the 0626 engagement).
- **S-MONITOR** (scene 14, fallback): if no R7 recording, render a `monitoring/digests/<date>.md` to branded HTML → `shots/shot-monitor.png` (green digest + one alert line).
- **S-MONTAGE** (scene 15): composite the three store homepages + the audit card + one frame of *this* video (the meta-flex) into `shot-montage.png`.

---

## 5. The 75s storyboard (frame-accurate · 30fps · 2250 frames total)

Legend: **MG** = motion graphics (no capture) · **CLIP** = screen recording (R-tag) · **SHOT** = still.

| # | Type | Frames | t (s) | On-screen copy / content | Source |
|---|------|--------|-------|--------------------------|--------|
| 1 | MG `title` | 105 | 0.0–3.5 | "A full software studio." | have |
| 2 | MG `message` | 105 | 3.5–7.0 | "20 specialists." / "One terminal." | — |
| 3 | MG `stat` | 150 | 7.0–12.0 | 20 specialists · 12 skills · 6 verticals → "10× faster." | — |
| 4 | CLIP `clip` | 165 | 12.0–17.5 | "One brief. The whole fleet mobilises." | **R1** |
| 5 | CLIP `clip` | 240 | 17.5–25.5 | "Design — logo, style book, screens." | **R2** |
| 6 | CLIP `clip` | 110 | 25.5–29.2 | "Aether — smart home." | **R3a** |
| 7 | CLIP `clip` | 110 | 29.2–32.8 | "Evergreen — made for ease." | **R3b** |
| 8 | CLIP `clip` | 110 | 32.8–36.5 | "Meridian — book a call." | **R3c** |
| 9 | CLIP `clip` | 135 | 36.5–41.0 | "Checkout, live." | **R4** |
| 10 | SHOT `showcase` | 100 | 41.0–44.3 | "SEO + content plan." | S-SEO |
| 11 | SHOT `showcase` | 100 | 44.3–47.7 | "Campaigns, ready to publish." | S-CAMPAIGN |
| 12 | CLIP `clip` | 150 | 47.7–52.7 | "Audited — every finding proven with a test." | **R6** |
| 13 | SHOT `showcase` | 100 | 52.7–56.0 | "Severity-rated. Go / No-Go." | S-AUDIT |
| 14 | CLIP/SHOT | 150 | 56.0–61.0 | "After launch — it never stops watching." (tech · sales · traffic, 24/7) | **R7** / S-MONITOR |
| 15 | SHOT `showcase` | 135 | 61.0–65.5 | "Real deliverables. On brand." | S-MONTAGE |
| 16 | MG `message` | 130 | 65.5–69.8 | "10× faster." / "A fraction of the cost." | — |
| 17 | MG `cta` | 155 | 69.8–75.0 | "ShipWithAI · shipwithai.nl" + "Even this video was made by the studio." | have |

Sum = 2250 frames = **75.0s** ✓. (Re-budgeted from the 16-scene cut to make room for the monitoring beat — earlier clips trimmed slightly.)

---

## 6. Final `scenes.ts` (drop-in)

When footage lands, this is the exact composition. Set `brand.durationSeconds = 75` in `src/brand.ts`. Clips live in `public/clips/`, stills in `public/`. `startFrom`/`endAt` (source frames) trim each recording to its highlight; tune after a first render.

```ts
export const scenes: Scene[] = [
  { type: "title", durationInFrames: 105, title: "A full software studio.", subtitle: "20 specialists. One terminal." },
  { type: "message", durationInFrames: 105, lines: ["20 specialists.", "One terminal."] },
  { type: "stat", durationInFrames: 150, stats: [
      { value: 20, label: "specialists" }, { value: 12, label: "skills" }, { value: 6, label: "verticals" },
    ], tagline: "10× faster." },
  { type: "clip", durationInFrames: 165, src: "clips/fleet.mp4", caption: "One brief. The whole fleet mobilises.", playbackRate: 6 },
  { type: "clip", durationInFrames: 240, src: "clips/claude-design.mp4", caption: "Design — logo, style book, screens.", playbackRate: 8 },
  { type: "clip", durationInFrames: 110, src: "clips/store-aether.mp4", caption: "Aether — smart home.", playbackRate: 3 },
  { type: "clip", durationInFrames: 110, src: "clips/store-evergreen.mp4", caption: "Evergreen — made for ease.", playbackRate: 3 },
  { type: "clip", durationInFrames: 110, src: "clips/store-meridian.mp4", caption: "Meridian — book a call.", playbackRate: 3 },
  { type: "clip", durationInFrames: 135, src: "clips/checkout.mp4", caption: "Checkout, live.", playbackRate: 3 },
  { type: "showcase", durationInFrames: 100, image: "shot-seo.png", caption: "SEO + content plan." },
  { type: "showcase", durationInFrames: 100, image: "shot-campaign.png", caption: "Campaigns, ready to publish." },
  { type: "clip", durationInFrames: 150, src: "clips/audit-test.mp4", caption: "Audited — every finding proven with a test.", playbackRate: 6 },
  { type: "showcase", durationInFrames: 100, image: "shot-audit-report.png", caption: "Severity-rated. Go / No-Go." },
  // Scene 14 — after-launch monitoring. Use the R7 recording, or swap to a showcase of shot-monitor.png.
  { type: "clip", durationInFrames: 150, src: "clips/monitoring.mp4", caption: "After launch — it never stops watching.", playbackRate: 4 },
  { type: "showcase", durationInFrames: 135, image: "shot-montage.png", caption: "Real deliverables. On brand." },
  { type: "message", durationInFrames: 130, lines: ["10× faster.", "A fraction of the cost."] },
  { type: "cta", durationInFrames: 155, title: "ShipWithAI", subtitle: "shipwithai.nl · even this video was made by the studio." },
];
```

Keep `brand.ts` on the studio theme (ink `#1A1A1A` / cream `#F4F1EA` / vermilion `#E4572E`, Newsreader). Add the music bed last: drop `music.mp3` in `public/` and an `<Audio>` at the composition root (volume ducked).

---

## 7. Prerequisites — status

**Built (ready to use):**
- ✅ `clip` scene type — `<OffthreadVideo trimBefore/trimAfter playbackRate>` in a branded frame (validated: typecheck + still render on Remotion 4.0.483).
- ✅ `stat` scene type — animated count-up counters (validated render).
- ✅ `claude-design` skill — two paths: **design-sync ("Create using Claude Code")** for high-fidelity component sync, and the lighter tokens/mockups GitHub round-trip. `ui-designer`/`ui-developer`/`/ecommerce` rewired off Figma.
- ✅ **Aether storefront built + verified** (Next.js, 15 routes); **Aether design system synced to Claude Design** via `/design-sync` (10 components, project `07b42760…`) — the "Create using Claude Code" path proven end-to-end.
- ✅ `shipwithai-monitor` plugin — `/monitor` + 6 monitor agents + 3 skills (post-launch 24/7 monitoring).
- ✅ `render-md.mjs` (markdown → branded HTML, validated).
- ✅ `gh` authed (`kivanov82`), `node` 22, `ffmpeg`, Stripe/Playwright/Vercel MCP connected; node Chromium installed.

**Needs an operator (when you're back):**
- ☐ Footage R1–R7 (recordings) + S-SEO/S-CAMPAIGN/S-MONITOR/S-MONTAGE (stills). R2 (Claude Design canvas) is being recorded now.
- ☐ The Claude Design canvas step (browser, login) for the remaining brands.
- ☐ A licensed `music.mp3`.

---

## 8. Runbook — when you're back

1. **Activate plugins** (reload Claude Code → accept trust/install).
2. **Brand 1 — Aether (deep):** `/ecommerce` with the Aether brief. During it: the `claude-design` skill scaffolds + pushes `aether-design` → **you open claude.ai/design, import it, design the screens** (record **R2**). Export back. `ui-developer` builds; `npm run dev` → **record R3a** (storefront) and **R4** (Stripe checkout). If the run uses the workflow tree, **record R1** here.
3. **Brand 2 — Evergreen:** `/ecommerce` with the Evergreen brief → **R3b**. (Add to R2/R4 if you want its canvas/checkout too.)
4. **Brand 3 — Meridian:** `/ecommerce` with the Meridian brief (booking, not cart) → **R3c**.
5. **Growth (Aether):** `/seo https://aether… ` + `/campaign` → render their `.md` with `render-md.mjs` → screenshot → `shot-seo.png`, `shot-campaign.png`.
6. **Audit breadth:** `/audit … --depth full` → **record R6** (`forge test` + tree). Copy `shot-audit-report.png` from the 0626 engagement (or re-render).
7. **Monitoring (after-launch):** `/monitor https://aether… ` on Aether → set up the watch + run a cycle → **record R7** (the `/monitor` cycle + a notification firing + the digest), or render the digest md → `shot-monitor.png`.
8. **Montage:** composite the three store homes + audit card + a promo frame → `shot-montage.png`.
9. **Compose:** `/promo` (subject = the studio) → `remotion-compose` copies the template into `engagements/shipwithai-promo-20260627/video`, `npm install`, drop clips into `public/clips/` + stills into `public/`, paste §6 `scenes.ts`, set `durationSeconds = 75`.
10. **Render & review:** `npx remotion render Promo out/promo.mp4`. Check pacing, caption legibility, that each clip's `startFrom`/`endAt` lands on the good moment. Tune and re-render.
11. **Music:** drop `music.mp3` in `public/`, add `<Audio>`, final render. Mark the engagement `complete`.

---

## 9. Notes
- **Honesty:** only real outputs on screen; the stats in scene 3 are the verified numbers above — don't inflate them. Stripe in **test mode**, no keys/cards visible.
- **Design source location:** the high-fidelity path (`/design-sync`) reads a **local** standalone component library — no repo needed. The lighter path uses a **tracked subfolder** (`design-sources/<brand>/`) in an existing repo, not a new public repo (creating one is classifier-gated).
- **Shoot long, keep tight:** capture more than 75s of raw; the speed-up + trims do the compression. Aether is the brand that goes deep; Evergreen/Meridian carry the range beat.
- **9:16 cut** (optional, later): same scenes, 1080×1920, re-stack the clip frames vertically.
