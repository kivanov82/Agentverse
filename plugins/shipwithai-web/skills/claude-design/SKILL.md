---
name: claude-design
description: Design UI with Claude Design (claude.ai/design) — the studio's design tool, not Figma. Two paths: high-fidelity design-sync of a real component library ("Create using Claude Code"), or a lighter GitHub tokens/mockups round-trip ("Create here"). Use for the design step of any web/e-commerce engagement.
allowed-tools: Read, Write, Edit, Bash
---

# Claude Design (the studio's design tool — not Figma)

**Claude Design** (`claude.ai/design`): chat panel left, live React canvas right. It designs from *your* design system so every screen is on-brand and maps 1:1 to shippable code. Authorize once per session with **`/design-login`**. The canvas step is human-in-the-loop (browser, login) — and it's the best footage in a promo.

Two ways to feed it your brand. Pick by fidelity:

## Path A — `design-sync` ("Create using Claude Code") · BEST FIDELITY · default

Bundles your **real React components** into a design system the canvas builds with. The mechanics live in the built-in **`/design-sync`** skill — run that; this section is the studio's hard-won prep + gotchas so it works first time.

**Where it runs:** the **main session / coordinator**, never a subagent — `/design-sync` needs the `DesignSync` tool, `AskUserQuestion`, and user approvals (project creation, the upload plan). A `ui-designer` subagent only *shapes the package*; the coordinator runs the sync.

**Prereq — a standalone, buildable, Next-free component library.** design-sync bundles a package's built `dist/`; a Next.js app won't bundle (`next/link`, `next/font`, `next/image`, app context, data fetching break in the canvas's generic React runtime). So shape a small library (the `ui-developer` is good at this):
- **Presentational, props-driven** components — no context, no fetching; plain `<a>`, inline SVG / `<img>`. (`CartDrawer` takes `lines`+`totals`+handlers; `ProductCard` takes a `product`.)
- `package.json` with `module`/`types`; a **tsup** build → `dist/index.mjs` + `dist/index.d.ts` + `dist/styles.css`. Install `react react-dom @types/react`.
- Exported `<Name>Props` interfaces **with JSDoc** — design-sync reads these as the API contract the canvas codes against.
- One `styles.css` = the `cssEntry`: `@import` the brand fonts, define tokens as CSS vars (`--brand-*`), then component classes.

**Gotchas that cost real iterations — bake them in up front:**
- **Components must own their backgrounds.** A section that relies on the host page's `body` background (e.g. a hero) renders washed-out in preview cards (white card + light text). Set the brand canvas on `html, body` in `styles.css` *and* give section components (`Hero`) their own `background`. (This was the one component we had to fix.)
- **Layout overrides** in `.design-sync/config.json` → `overrides`: wide components (grids, tables, full-width bars) → `{"cardMode":"column"}`; overlays / fixed-position drawers → `{"cardMode":"single","viewport":"WxH","primaryStory":"<export>"}`. A fixed-position drawer measuring 0px height is a **benign** `[RENDER_THIN]` — confirm the screenshot, record it in `.design-sync/NOTES.md`, move on.
- **Render check needs a node Chromium** (~200 MB) — the Playwright *MCP* the agents use is separate. macOS cache: `~/Library/Caches/ms-playwright` (NOT `~/.cache`). `npm i playwright` in `.ds-sync` + `npx playwright install chromium`. No browser → floor cards (`--no-render-check`, components still ship fully functional).
- **Type-only exports** (unions, data interfaces) are filtered automatically — don't bother pruning them.
- **Authored previews** go in `.design-sync/previews/<Name>.tsx` (named exports = cards). Use `import type` for type-only imports so esbuild erases them. Realistic data, the variant axis swept.
- **Upload order is strict**: sentinel (`_ds_needs_recompile`) first → all content → re-arm sentinel → `_ds_sync.json` **last**. Verify with `list_files`.

**Flow:** shape package → `/design-sync` (it: stages `.ds-sync/`, writes `.design-sync/config.json`, converts, validates, you author+grade previews, authors the conventions header, creates the project, uploads). Then the canvas designs screens with the real components → export back (below).

## Path B — GitHub tokens/mockups round-trip ("Create here") · lighter

For early concepting, or before a buildable library exists. Claude Design imports a GitHub repo and reads tokens + reference HTML.
- Put the design source in a **tracked subfolder of an existing repo** — e.g. `design-sources/<brand>/` with `tokens.json`, a `DESIGN.md` brief, `components.md`, and HTML mockups. Commit + push, then in Claude Design: **Create here → GitHub** → point at that subfolder. (`engagements/` is gitignored, so the source must live in a tracked path to appear on GitHub. Private repos work if the user's Claude Design can read them.)
- **Do NOT create a throwaway public repo** to hold it — creating a public repo is an outward-facing action the safety classifier blocks without explicit user authorization. A subfolder in an existing repo sidesteps the gate entirely.

## Bringing designs back (either path)

Export from the canvas — **Standalone HTML / ZIP**, or **"Handoff to Claude Code"** — into `engagements/<slug>/design/claude-design-export/`, and grab the share URL. The `ui-developer` builds the production storefront from that export + `tokens.json` (don't guess from a screenshot).

## Deliverables (`engagements/<slug>/design/`)
- the standalone design-system package (Path A) and/or `design-sources/<brand>/` tokens+briefs+mockups (Path B)
- `claude-design-export/` (canvas export) + the Claude Design **project URL / share URL** (record in `design/README.md`)
- `style-guide.md`

## Notes
- **No client secrets** in any synced/pushed source — tokens + design intent only.
- For a **dark brand**: set the canvas globally (`html,body`) *and* let components own their surfaces — makes both the preview cards and real designs correct.
- The mockups are always the fallback: if the canvas step can't run, the `ui-developer` builds from `design/mockups/*.html` + `tokens.json` and the rest of the pipeline is identical.
