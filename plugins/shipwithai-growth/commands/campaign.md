---
description: Plan a marketing campaign and produce ready-to-use launch copy — strategy, channel plan, posts, emails.
argument-hint: "[what you're promoting] [focus notes...]"
intake_questions:
  - id: product
    prompt: "What are we promoting? (product / business / launch)"
    type: text
    required: true
  - id: goal
    prompt: "Primary goal of the campaign?"
    type: choice
    required: true
    options:
      - { label: "Launch a new thing", value: launch, recommended: true }
      - { label: "Build awareness", value: awareness }
      - { label: "Generate leads", value: leads }
      - { label: "Drive sales", value: sales }
  - id: channels
    prompt: "Which channels? (e.g. X/Twitter, LinkedIn, email, blog, ads)"
    type: text
    required: false
  - id: brandUrl
    prompt: "Brand/website URL to match tone & visuals? (optional)"
    type: url
    required: false
---

# /campaign — marketing campaign engagement

Produce a campaign plan plus ready-to-publish copy, entirely local.

**Already provided:** `$ARGUMENTS`

## Step 1 — Intake
Run the core **`intake`** convention against this command's `intake_questions`. Pre-fill from `$ARGUMENTS`. If `brandUrl` was given, run **`brand-extract`** for tone/visual cues.

## Step 2 — Set up the engagement
Slug = `<product>-campaign-<YYYYMMDD>`. `mkdir -p engagements/<slug>`. Write `brief.md` and append `{ slug, vertical: "campaign", goal, date, status: "active" }` to `engagements/index.json`.

## Step 3 — Run the team (via the `Agent` tool)
1. **marketing** — campaign strategy: positioning, messaging pillars, audience, channel plan + cadence mapped to the `goal`, and a launch timeline.
2. **tech-writer** — turn the strategy into finished assets: channel posts (per declared channel), an email (or sequence), and any landing/announcement copy.

## Step 4 — Deliverable
Write `engagements/<slug>/campaign-plan.md` (strategy + channel plan + timeline) and a `copy/` folder with one file per asset (e.g. `copy/x-thread.md`, `copy/linkedin.md`, `copy/launch-email.md`). On-brand tone throughout.

## Step 5 — Report back
Plain language: the core message, the channel plan in one line, and the list of ready-to-publish assets with paths. Mark the engagement `status: "complete"` in `engagements/index.json`.
