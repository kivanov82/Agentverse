---
description: Build an on-brand e-commerce storefront — guided intake, Claude Design round-trip, frontend + backend + payments, runnable locally with screenshots.
argument-hint: "[product/store idea] [--deploy]"
intake_questions:
  - id: products
    prompt: "What do you sell? (a sentence or two about the products)"
    type: text
    required: true
  - id: count
    prompt: "Roughly how many products?"
    type: text
    required: false
  - id: photos
    prompt: "Do you have product photos?"
    type: choice
    required: true
    options:
      - { label: "Yes, ready to use", value: have, recommended: true }
      - { label: "Some of them", value: some }
      - { label: "No — use placeholders", value: none }
  - id: brandUrl
    prompt: "A brand or reference URL so we match your look? (optional)"
    type: url
    required: false
---

# /ecommerce — e-commerce build engagement

Design and build a runnable, on-brand storefront, entirely local. Demonstrates the **Claude Design** round-trip (code↔canvas via GitHub).

**Already provided:** `$ARGUMENTS`

## Step 1 — Intake
Run the core **`intake`** convention against this command's `intake_questions` frontmatter. Pre-fill from `$ARGUMENTS`; ask only what's missing. `--deploy` (if present) means also ship it live via the deployer.

## Step 2 — Set up the engagement
Slug = `<brand-or-store>-<YYYYMMDD>`. `mkdir -p engagements/<slug>/store`. Write `engagements/<slug>/brief.md` and append a `{ slug, vertical: "ecommerce", date, status: "active" }` entry to `engagements/index.json`. If `brandUrl` was given, run the **`brand-extract`** skill and keep the theme.

## Step 3 — Run the team (one specialist at a time, via the `Agent` tool)
Each specialist works in `engagements/<slug>/store`. For a demo-scope run, take it to a runnable storefront:
1. **ux-analyst** — core flows (browse → product → cart → checkout), a short flows note.
2. **ui-designer** — visual design via the **`claude-design`** skill (code→design). Two paths: **high-fidelity** = a standalone Next-free component library synced with `/design-sync` ("Create using Claude Code", run from the main session); **lighter** = `tokens.json` + `DESIGN.md` + HTML mockups in a tracked `design-sources/<brand>/` imported via "Create here". Emit `design/src/tokens.json` either way.
3. **ui-developer** — build the Next.js storefront (design→code): implement from the Claude Design export + `tokens.json` (+ `frontend-design` skill); catalog, product page, cart. Keep components reusable/presentational so they can double as the synced design system.
4. **e-commerce-specialist** — product catalog model, cart logic, shipping basics.
5. **payment-integration** — checkout via Stripe (test mode; use the stripe skills/MCP).
6. **deployer** — only if `--deploy`: ship to Vercel and return the URL.
7. **code-reviewer** — quick pass with `/code-review`.

Keep scope honest: a clean, runnable storefront with a few real/placeholder products beats a half-finished megastore.

## Step 4 — Capture + deliverable
Run the store locally (`pnpm dev` / `npm run dev` in the store dir). Use **Playwright** (`browser_navigate` + `browser_take_screenshot`) to capture the homepage, a product page, and the cart into `engagements/<slug>/shots/`. These screenshots double as footage for the marketing-video vertical.

## Step 5 — Report back
Plain language: what was built, how to run it (`cd engagements/<slug>/store && npm run dev`), the live URL if deployed, the screenshot paths, and any follow-ups. Mark the engagement `status: "complete"` in `engagements/index.json`.
