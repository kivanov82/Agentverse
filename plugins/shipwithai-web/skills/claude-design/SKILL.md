---
name: claude-design
description: Design UI in Claude Design (claude.ai/design) with a code↔design round-trip via GitHub. Push a starter repo of tokens + component stubs, design the screens on the live canvas, then bring the export back into the engagement for the UI Developer to build. Use this for the design step of any web/e-commerce engagement instead of Figma.
allowed-tools: Read, Write, Edit, Bash
---

# Claude Design (code ↔ design round-trip)

**Claude Design** (`claude.ai/design`) is Anthropic's AI design workspace: a chat panel on the left, a live design canvas on the right (Opus-class model). It can **read a GitHub repo** to design with your real tokens/components, and **export** the result as standalone HTML / ZIP / PDF / PPTX, a share URL, or a "Handoff to Claude Code" bundle.

This is the studio's design tool — **we do not use Figma here.** The round-trip is: scaffold a tiny design-source repo → push to GitHub → design on the canvas → bring the export back → the UI Developer builds the real storefront from it.

> The canvas step happens in a browser and needs a Claude Pro/Max/Team login, so it is **human-in-the-loop**: an agent scaffolds the repo and integrates the export automatically, but a person drives the canvas. (That canvas moment is also the best footage for a promo — see the video vertical.)

## Step 1 — Scaffold the design-source repo (agent, automatic)

Create a minimal repo Claude Design can read for tokens + intent. Inside the engagement:

```
mkdir -p engagements/<slug>/design/src
```

Write three things:

1. `engagements/<slug>/design/src/tokens.json` — the brand's design tokens (colors, typography, spacing, radii). Seed from the `brand-extract` theme if a brand URL was given; otherwise pick a distinctive, on-audience palette (no "AI slop" — see the `ui-designer` aesthetic rules).
2. `engagements/<slug>/design/src/components.md` — a short list of the components/screens to design (e.g. Header, Hero, ProductCard, ProductPage, Cart, Checkout) with any constraints.
3. `engagements/<slug>/design/src/DESIGN.md` — the **aesthetic brief**: audience, mood, the named direction (e.g. "futuristic / electric", "warm & accessible / large-type", "premium / institutional serif"), do's and don'ts, reference vibes. This is what steers the canvas.

Then publish it (a throwaway public repo is fine — it holds no client secrets, only tokens + intent):

```
cd engagements/<slug>/design/src
git init -q && git add -A && git commit -qm "design source: tokens + brief for <brand>"
gh repo create <gh-user>/<brand>-design --public --source . --push
```

Report the repo URL back so the operator can import it.

## Step 2 — Design on the canvas (operator, in the browser)

Tell the operator exactly what to do (and to screen-record it if footage is wanted):

1. Open **claude.ai/design** → new design → **Import from GitHub** → pick `<brand>-design`. Claude Design reads `tokens.json` + the briefs.
2. Paste the design prompt. Template:
   > "Using the tokens and the DESIGN.md brief in this repo, design a `<brand>` storefront: a homepage (hero + featured products), a product page, and a checkout. Audience: `<audience>`. Aesthetic: `<direction>`. Use the repo's color and type tokens — no generic system fonts, no purple-on-white. Mobile-first, with desktop variants."
3. Iterate on the canvas (chat, inline comments, direct edits) until each screen is right. Keep the screens consistent with the tokens.

## Step 3 — Bring the export back (operator + agent)

In Claude Design: **Export** → **Standalone HTML** (or ZIP). Save/unzip into:

```
engagements/<slug>/design/claude-design-export/
```

(Or use **Handoff to Claude Code** and point the bundle at the same folder.) To keep the round-trip captured in git, commit the export back to the design repo too. Also grab the **share URL** — it's a viewable deliverable and good footage.

## Step 4 — Integrate (UI Developer)

The `ui-developer` builds the real Next.js storefront **from the export**: read the exported HTML/components for layout and `design/src/tokens.json` for values, map them onto the project's design system (Tailwind + CSS variables), then verify in a real browser with Playwright. The export is the design source of truth — don't guess from a screenshot.

## Deliverables (in `engagements/<slug>/design/`)

- `src/tokens.json`, `src/components.md`, `src/DESIGN.md` — the design source (pushed to GitHub)
- `claude-design-export/` — the exported screens (HTML/ZIP) from the canvas
- `style-guide.md` — short brand + usage notes (the designer writes this)
- the Claude Design **share URL** (record it in `design/README.md`)

## Notes

- **No secrets in the repo** — only tokens + design intent. Client/business data never goes to the canvas repo.
- **Honest by default** — the export is real design output; the UI Developer builds the production code. Don't ship the raw export as the product.
- **Throwaway repos** — name them `<brand>-design`; they can be deleted after the engagement (`gh repo delete`).
- If the operator can't run the canvas step, fall back to the `ui-designer`'s in-repo HTML mockups (`design/mockups/*.html`) — the rest of the pipeline is identical.
