---
description: End-to-end delivery orchestrator — guide a product from brief to live + monitored, running every vertical in sequence (decide → design → build → commerce → deploy → grow → promo → monitor) with human checkpoints. The studio's full-pipeline conductor.
argument-hint: "[what you're building] [--type ecommerce|site|app] [--phases ...]"
intake_questions:
  - id: product
    prompt: "What are we building? (one or two sentences)"
    type: text
    required: true
  - id: type
    prompt: "What kind of product is it?"
    type: choice
    required: true
    options:
      - { label: "E-commerce store", value: ecommerce, recommended: true }
      - { label: "Marketing / content site", value: site }
      - { label: "Web app", value: app }
  - id: brandUrl
    prompt: "A brand / reference URL? (optional)"
    type: url
    required: false
  - id: phases
    prompt: "Which phases should we run?"
    type: choice
    required: true
    multi: true
    options:
      - { label: "Decide (business decisions + brief)", value: decide, recommended: true }
      - { label: "Design (Claude Design)", value: design, recommended: true }
      - { label: "Build", value: build, recommended: true }
      - { label: "Commerce (payments)", value: commerce }
      - { label: "Deploy (Vercel)", value: deploy, recommended: true }
      - { label: "Grow (SEO + campaign)", value: grow }
      - { label: "Promo (video)", value: promo }
      - { label: "Monitor (24/7)", value: monitor }
  - id: deployTarget
    prompt: "Deploy target?"
    type: choice
    required: false
    options:
      - { label: "Vercel", value: vercel, recommended: true }
      - { label: "None (run locally)", value: none }
---

# /ship — full-delivery orchestrator

The studio's conductor. Takes a product from a brief to **live + monitored**, running each vertical **one after another** and pausing at the moments that need you. Every vertical's own command still runs standalone — `/ship` just sequences them and threads the engagement dir through.

**Already provided:** `$ARGUMENTS`

## How it works
The **`pm`** agent drives this. For each phase it delegates to that vertical's agents/skills (via the `Agent` / `Skill` tools), confirms the deliverable landed in the engagement dir, **checkpoints with the operator**, then advances. The engagement dir is the shared thread between phases — each phase reads the last one's output.

## Step 1 — Intake + plan
Run the core **`intake`** convention. From `type`, default the phase set (the operator can trim via `phases`):
- **ecommerce** → Decide · Design · Build · Commerce · Deploy · Grow · Promo · Monitor
- **site** → Decide · Design · Build · Deploy · Grow · Monitor
- **app** → Decide · Design · Build · Deploy · Monitor
Show the resolved phase plan and **confirm it before running**.

## Step 2 — Set up the engagement
Slug = `<brand-or-product>-<YYYYMMDD>`. `mkdir -p engagements/<slug>`. Write `brief.md`; append `{ slug, vertical: "ship", type, date, status: "active" }` to `engagements/index.json`. If `brandUrl` was given, run **`brand-extract`** and keep the theme. This one dir carries every phase's output.

## Step 3 — Run the phases (in order; checkpoint between)
Run only the selected phases, each delegating to its vertical:
1. **Decide** (`pm`) — the business decisions: positioning, audience, value prop, what we sell, success metric, brand direction. Write them into `brief.md`.
2. **Design** (`ui-designer` + **`claude-design`** skill) — turn the decisions into a **creative brief** (must-haves, explicit anti-patterns, page list + per-page intent, tokens/aesthetic), then the **Claude Design canvas** (**human checkpoint:** the operator designs / approves), export back to `design/claude-design-export/`.
3. **Build** (`ui-developer` + `e-commerce-specialist` / `backend-developer` as needed) — implement the export into a runnable app; verify in a real browser (Playwright).
4. **Commerce** (`payment-integration`) — checkout / payments (skip for non-commerce).
5. **Deploy** (`deployer`) — ship to `deployTarget` (Vercel) and return the **live URL**. **Checkpoint:** confirm before going live.
6. **Grow** (`seo-specialist` + `marketing` + `tech-writer`) — run the `/seo` and `/campaign` flows against the live URL.
7. **Promo** (`video-producer`) — the `/promo` flow from the captured deliverables.
8. **Monitor** (`/monitor`) — stand up 24/7 monitoring on the live URL.

## Step 4 — Report
A plain-language delivery summary: what shipped, the **live URL**, the deliverable per phase (+ paths), what's being monitored, and any follow-ups. Mark the engagement `complete` (or keep `active` while monitoring runs).

## Notes
- **Checkpoints, not autopilot.** Pause at the design canvas, before deploy, and wherever the operator wants a gate; resume after. This is a *guided* pipeline.
- **Standalone still works.** Every vertical command (`/ecommerce`, `/seo`, `/promo`, `/monitor`, …) runs on its own; `/ship` sequences them.
- **Deterministic stretches** (e.g. a build → verify → deploy loop) can be backed by a `Workflow` script — like the audit vertical's `audit.js` — when you want them hands-off.
- **Audit is its own service**, not part of a product build — run `/audit` directly rather than via `/ship`.
