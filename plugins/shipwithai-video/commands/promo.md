---
description: Produce a short branded marketing video (Remotion) — guided intake, capture real deliverable footage, compose, render to MP4.
argument-hint: "[subject] [--length 30|45|60]"
intake_questions:
  - id: subject
    prompt: "What's the video about?"
    type: text
    required: true
  - id: length
    prompt: "How long?"
    type: choice
    required: true
    options:
      - { label: "30 seconds — punchy sizzle", value: "30", recommended: true }
      - { label: "45 seconds", value: "45" }
      - { label: "60 seconds — explainer", value: "60" }
  - id: brandUrl
    prompt: "Brand URL for colors/logo? (optional)"
    type: url
    required: false
  - id: footage
    prompt: "Which deliverables/screenshots to feature? (paths, or 'auto' to pull from recent engagements)"
    type: text
    required: false
---

# /promo — marketing video engagement

Produce a short, on-brand marketing video, rendered to MP4, entirely local.

**Already provided:** `$ARGUMENTS`

## Step 1 — Intake
Run the core **`intake`** convention against this command's `intake_questions`. Pre-fill from `$ARGUMENTS`. Default style is a **30–45s mixed sizzle**: real deliverable screenshots + animated agent/process scenes, captions, music, no voiceover. If the subject is **ShipWithAI itself**, default `brandUrl` to `https://shipwithai.nl` and `footage` to `auto`.

## Step 2 — Set up the engagement
Slug = `<subject>-promo-<YYYYMMDD>`. `mkdir -p engagements/<slug>/shots`. Write `brief.md` and append `{ slug, vertical: "promo", date, status: "active" }` to `engagements/index.json`. Run **`brand-extract`** on `brandUrl` and keep the theme.

## Step 3 — Gather footage
Delegate to the **video-producer** subagent (or run inline) using the **`capture-footage`** skill:
- If `footage` is explicit paths, use those.
- If `auto`, pull real deliverables from existing `engagements/` — render markdown reports (e.g. an audit `report.md`) to branded HTML and screenshot them, screenshot any built storefront from its local dev server, grab Figma boards. Save into `engagements/<slug>/shots/`.

## Step 4 — Compose & render
Use the **`remotion-compose`** skill: copy the bundled template into `engagements/<slug>/video`, fill `src/brand.ts` from the theme, author `src/scenes.ts` (title → message → 2–4 deliverable showcases → CTA, totalling the chosen length), drop the captured stills + logo into `public/`, then `npx remotion render Promo out/promo.mp4`.

## Step 5 — Review & deliver
Open the MP4; check pacing, caption legibility, brand consistency. Re-render after any fixes. Report the path (`engagements/<slug>/video/out/promo.mp4`), the duration, and what's featured. Mark the engagement `status: "complete"` in `engagements/index.json`.

## For the ShipWithAI self-promo
Subject = the studio. Beat sheet (~30s): title (logo + "An AI studio that ships") → a `grid` of the verticals (audit · e-commerce · SEO · campaigns · video) → showcases of the real audit report + a built storefront → CTA (`shipwithai.nl`). This is the share-with-prospects asset.
