# ShipWithAI

> A full software studio in your terminal. AI specialists that **design, build, audit, and ship** — locally, in an afternoon.

**[shipwithai.nl](https://shipwithai.nl)** · [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

ShipWithAI is a **local-first AI delivery studio** — a fleet of specialist agents packaged as Claude Code plugins that produce real client deliverables on your machine. No hosted backend, no automated billing: you run the studio and bill per engagement.

**14 specialist agents · 8 skills · 5 use-cases**, connected to Figma, Playwright, Vercel, Stripe, and GitHub.

## What it ships

| Command | Vertical | Deliverable |
|---------|----------|-------------|
| `/audit` | smart-contract audit | severity-rated report + Go/No-Go, every finding proven with a Foundry PoC |
| `/ecommerce` | e-commerce build | a runnable, on-brand storefront |
| `/seo` | SEO optimization | audit + keyword + content plan |
| `/campaign` | marketing campaign | strategy + ready-to-publish copy |
| `/promo` | marketing video | a branded MP4 (Remotion) |

## Run it

This repo is a local Claude Code plugin marketplace. Open it in Claude Code:

1. **Activate** — accept the one-time trust/install prompt (the studio is pre-wired in `.claude/settings.json`). Fallback:
   ```
   /plugin marketplace add .
   /plugin install shipwithai-core shipwithai-web shipwithai-growth shipwithai-audit shipwithai-video
   ```
2. **Run a vertical**, e.g.:
   ```
   /shipwithai-audit:audit https://github.com/your-org/contracts --depth full
   /shipwithai-web:ecommerce
   /shipwithai-video:promo
   ```
3. **Collect the deliverable** from `engagements/<slug>/`.

## Structure

```
plugins/        # the 5 vertical plugins (the studio)
docs/           # production docs (promo script, etc.)
engagements/    # per-client work (gitignored; only index.json is tracked)
```

See **[CLAUDE.md](./CLAUDE.md)** for the full architecture and conventions.
