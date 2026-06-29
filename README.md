# ShipWithAI

> An **AI-native delivery studio**. Humans bring the strategy, taste and judgment; a fleet of specialist agents does the labor; and it all runs on a **shared, legible context layer**.

**[shipwithai.nl](https://shipwithai.nl)** · [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

In the old world a company *is* its people — they hold the knowledge and do the work. In the new world people move up to **strategy, taste and judgment**, **agents do the labor**, and the company becomes a **shared, legible context layer** — the brief, the brand, the conventions, the playbooks — that both plug into. **ShipWithAI is built exactly like that**: a fleet of specialist agents running on an open context layer (its plugins, skills and conventions) to **design, build, deploy, grow and monitor** real products. The **moat is legibility** — a delivery operation documented so well that agents can run it. Runs locally as Claude Code plugins; billed per engagement.

**20 specialist agents · 12 skills · 6 use-cases**, connected to Claude Design, Playwright, Vercel, Stripe, and GitHub.

## What it ships

| Command | Vertical | Deliverable |
|---------|----------|-------------|
| `/audit` | smart-contract audit | severity-rated report + Go/No-Go, every finding proven with a Foundry PoC |
| `/ecommerce` | e-commerce build | a runnable, on-brand storefront |
| `/seo` | SEO optimization | audit + keyword + content plan |
| `/campaign` | marketing campaign | strategy + ready-to-publish copy |
| `/promo` | marketing video | a branded MP4 (Remotion) |
| `/monitor` | post-launch monitoring | 24/7 watch + digests/alerts (tech · sales · traffic · SEO · security · reputation) |

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
