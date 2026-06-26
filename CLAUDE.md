# ShipWithAI — local-first AI delivery studio

ShipWithAI is a **local-first delivery studio**: a fleet of specialist AI agents that run inside Claude Code to produce real client deliverables — smart-contract audits, e-commerce builds, SEO, marketing campaigns, and marketing videos. The studio is packaged as **Claude Code plugins** and runs locally; engagements are billed per project (no automated payments).

Brand: **ShipWithAI** (no dot). Domain: **shipwithai.nl**.

> **History.** This repo was previously a hosted multi-agent web SaaS (a Next.js app + a bespoke agent runtime + Firestore + Stripe/x402 payment rails). That system was retired in the 2026-06 pivot to local-first; the old `apps/web`, `packages/core`, `agents/`, `scripts/`, `memory/`, and monorepo scaffolding were removed (recoverable from git history). The agent prompts and audit methodologies — the real IP — were ported into the plugins below.

## Structure

```
.claude-plugin/marketplace.json   # local plugin marketplace (source: path — loads from disk)
.claude/settings.json             # auto-activates the marketplace + plugins (tracked)
plugins/
  shipwithai-core/                # pm coordinator + shared skills (intake, brand-extract)
  shipwithai-audit/               # /audit      — solidity-auditor + 3 methodologies + workflow
  shipwithai-web/                 # /ecommerce  — design/build/payments/deploy (Figma two-way)
  shipwithai-growth/              # /seo /campaign — seo / marketing / tech-writer / ux-analyst
  shipwithai-video/               # /promo      — Remotion video + capture/compose skills + template
docs/                             # production docs (e.g. promo-script.md)
engagements/                      # per-client working dirs (gitignored; only index.json tracked)
```

## How it works

- **Plugins auto-activate.** `.claude/settings.json` registers the local `shipwithai` marketplace (`extraKnownMarketplaces`) and enables all five plugins (`enabledPlugins`). On first open you accept a one-time trust/install prompt; then the commands are live — no `/plugin` typing. Fallback: `/plugin marketplace add .` then `/plugin install`.
- **Each vertical is a wizard.** Run its slash command (e.g. `/shipwithai-audit:audit`). The command runs the shared `intake` convention against its `intake_questions:` frontmatter (clickable choices + free-text), sets up `engagements/<slug>/`, runs the specialists, and produces the deliverable.
- **Deliverables are files** written into `engagements/<slug>/` — reports, built sites, plans, MP4s. Specialists read/write the local working tree; there are no output tools or external persistence.
- **The PM coordinates** multi-agent verticals by delegating to specialist subagents (the `Agent` tool) one at a time, or via a bundled Workflow script for parallel/verified flows (the audit uses one).

## The verticals

| Command | Vertical | Produces |
|---------|----------|----------|
| `/audit` | smart-contract audit | severity-rated report + Go/No-Go (Feynman · Nemesis · State-Inconsistency, each finding proven with a Foundry PoC) |
| `/ecommerce` | e-commerce build | runnable on-brand storefront + screenshots |
| `/seo` | SEO optimization | SEO audit + keyword + content plan |
| `/campaign` | marketing campaign | campaign plan + ready-to-publish copy |
| `/promo` | marketing video | branded MP4 (Remotion) from captured deliverables + motion graphics |

## Key concepts

### Plugin anatomy
A vertical plugin = `commands/<name>.md` (the wizard) + `agents/*.md` (subagents, with `name`/`description`/`tools`/`model` frontmatter) + `skills/*/SKILL.md` + optional `workflows/*.js`. `shipwithai-core` holds the `pm` agent and the shared `intake` + `brand-extract` skills every vertical reuses. There are 14 specialist agents and 8 skills across the plugins.

### Intake wizard
Each command declares its questions in an `intake_questions:` YAML frontmatter block — the single source of truth (the local-first heir to the old `use-cases.ts`). The core `intake` skill reads that block: choices → `AskUserQuestion` (clickable), free-text asked conversationally, anything pre-filled from args is skipped. It emits a normalized brief the specialists act on.

### Audit workflow
`/audit` at `full` depth runs `plugins/shipwithai-audit/workflows/audit.js` via the Workflow tool: Feynman + State-Inconsistency run once each as independent passes, then **Nemesis runs fusion-only** (its Phase-4 feedback loop over their combined output — it does NOT re-run the hunt passes), then every Critical/High/Medium finding is adversarially verified, then synthesized. `quick`/`standard` depths delegate to the `solidity-auditor` subagent directly. **Gotcha:** the Workflow runtime delivers the `args` global as a JSON string — workflow scripts must `JSON.parse` it (see `audit.js`).

### Claude Design (two-way Figma)
In `shipwithai-web`: `ui-designer` does **code→design** (Figma write tools + the `figma-generate-design`/`figma-use` skills), `ui-developer` does **design→code** (Figma read via `get_design_context` + `frontend-design`) and verifies the result in a browser with Playwright.

### Marketing-video pipeline
`shipwithai-video` produces an MP4 with Remotion. `capture-footage` gathers real footage — branded HTML deliverables → Playwright screenshot (the Playwright MCP blocks `file://`, so serve over localhost), Figma frame renders, browser captures. `remotion-compose` copies the bundled **data-driven template** (`plugins/shipwithai-video/template/`), customizes `src/brand.ts` + `src/scenes.ts`, drops stills/clips into `public/`, and renders (`npx remotion render`). Screen recordings enter via `<OffthreadVideo playbackRate>` (a `clip` scene type — to be added). The current promo plan lives in `docs/promo-script.md`.

### Connected tools (MCP)
Figma (design), Playwright (browser/test/capture), Vercel (deploy), Stripe (payments), GitHub + Brave (repo/search) — all via globally-enabled Claude Code plugins; agents reference the `mcp__*` tools directly. No plugin-level `.mcp.json` is needed.

## Engagements
Per-client work lives in `engagements/<owner>-<slug>-<YYYYMMDD>/`. `engagements/index.json` is the tracked registry (`{slug, vertical, date, status}`); everything else under `engagements/` is gitignored (client code is never committed). Mark `status: complete` when a deliverable ships.

## Conventions when working here
- Build new work as plugin-shaped subagents / skills / commands / workflows — not as a node app.
- Agent tool lists use native tools + `mcp__*` patterns; no legacy tool names (no `github_read_files`, `submit_deliverable`, `request_handoff`, etc.).
- Deliverables are files in the engagement dir; don't reintroduce output tools, Firestore, or payment rails.
- The Remotion template self-installs per engagement (`npm install` inside the copied `video/` dir). `node` + `ffmpeg` are available.
- To add a vertical: a new `plugins/shipwithai-<name>/` with a `commands/<name>.md` wizard, its specialist agents, any skills, and an entry in `marketplace.json` + `.claude/settings.json` `enabledPlugins`.
