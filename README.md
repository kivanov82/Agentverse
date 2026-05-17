# ShipWithAI

> A network of AI agents that audit, build, and ship software for you.

Live at **[shipwithai.nl](https://shipwithai.nl)**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## What it does

You drop a GitHub repo URL, our agents read the code and deliver a real work product.

The public launch is focused on **one** use case:

### Solidity Audit
A two-agent team — Project Manager and Solidity Auditor — runs three independent audit methodologies over your contracts and ships a branded PDF report.

| Methodology | What it does |
|---|---|
| **Feynman** | First-principles business-logic sweep. Anything the agent can't explain end-to-end becomes a finding. |
| **Nemesis** | Adversarial loop — attacks the Feynman output as a malicious actor would, until the finding set converges. |
| **State-Inconsistency** | Hunts for coupled-state desync: any mutation of one variable that forgets to update its counterpart. |

You get markdown + structured JSON in the dashboard, plus a downloadable PDF themed with your own brand colors and logo.

Other use cases (landing pages, app prototypes, e-commerce, SEO) remain in the codebase as multi-agent flows but are not the public focus.

## How it works

```
1. Sign in (Google or wallet via SIWE)        $5 starter credit
2. Pick "Solidity Audit", paste repo URL      Optional: scope + brand URL
3. Audit runs (Feynman → Nemesis → State)     ~3-8 USD deducted from credit balance
4. Download markdown + PDF                    Listed in dashboard deliverables
```

Need more credits? Top up via Stripe (card) or USDC on Base (x402). Both feed the same balance.

## Quick start

```bash
pnpm install
pnpm dev                 # http://localhost:3000

# Invoke an agent directly from the CLI
pnpm invoke pm "Plan a token launchpad project"
```

### Required env vars (local dev)

See `.env.example` for the full list. The minimum to get a local audit running:

- `ANTHROPIC_API_KEY` — Claude API
- `FIREBASE_PROJECT_ID` + `FIREBASE_SERVICE_ACCOUNT_KEY` — Firestore
- `GITHUB_APP_ID` + `GITHUB_APP_INSTALLATION_ID` + `GITHUB_APP_PRIVATE_KEY` + `GITHUB_PAT` + `GITHUB_REPO_OWNER` — repo reads
- `SHIPWITHAI_FREE_MODE=true` (skips auth + credit gate so you can run without setting up NextAuth locally)

## Architecture

```
   apps/web/             Next.js 14 (App Router) dashboard
   ├── app/api/          REST routes (agents, projects, sessions,
   │                     credits, topup, webhooks, deliverables)
   └── components/       Chat panel, paywall overlay, top-up modal, audit explainer

   packages/
   ├── core/             Firestore store, agent runner, tool registry,
   │                     agent-skills loader, brand scraper, types
   └── orchestrator/     Multi-agent workflow coordination

   agents/<id>/
   ├── CLAUDE.md         System prompt
   ├── config.json       Model, tools, outputTool, maxIterations, skills allowlist
   └── skills/<skill>/   Optional SKILL.md files auto-injected into the prompt
```

**Stack**
- Next.js 14 (App Router) · React · Tailwind · Framer Motion
- Zustand for client state, Firestore as the sole persistence layer
- NextAuth (JWT) with Google + SIWE providers
- Stripe Checkout + x402 USDC-on-Base for credit top-ups
- `@react-pdf/renderer` for branded report rendering (chosen over Puppeteer to keep the Alpine container lean)
- Claude Opus / Sonnet / Haiku per-agent via the Anthropic API

**Agents** (18 total) — `pm`, `solidity-auditor`, `solidity-developer`, `ui-designer`, `ui-developer`, `backend-developer`, `mobile-developer`, `ux-analyst`, `seo-specialist`, `marketing`, `tech-writer`, `e-commerce-specialist`, `payment-integration`, `infrastructure`, `deployer`, `qa-tester`, `unit-tester`, `code-reviewer`.

The Solidity Auditor loads three skill modules (`feynman-auditor`, `nemesis-auditor`, `state-inconsistency-auditor`) auto-discovered from its `skills/` folder.

## Credit model

| | |
|---|---|
| **First sign-in** | $5 starter credit, granted atomically with user creation |
| **Pricing** | Every agent call deducts 5× the Claude API cost from your balance |
| **Top-up rails** | Stripe (card) → `POST /api/topup/stripe` · x402 USDC on Base → `POST /api/topup/x402` |
| **Ledger** | Firestore `creditLedger` + materialised `creditBalance` on the user doc, transactional debits |
| **Gate** | `/api/agents/[id]/invoke` returns HTTP 402 when balance < $0.50 — UI surfaces a paywall overlay |

## Deployment

Production runs on Cloud Run (`agentverse` service, `europe-west1`) in the `bright-union` GCP project.

```bash
# Full rebuild + deploy
./scripts/deploy.sh

# Redeploy the existing :latest image (no rebuild)
./scripts/deploy.sh --no-build
```

The script pulls all secrets from Secret Manager and wires the env vars Cloud Run needs. The custom domain `shipwithai.nl` is attached via a Cloud Run domain mapping.

## Repository layout

```
agent-verse/
├── apps/web/                   Next.js dashboard
├── packages/{core,orchestrator}
├── agents/<id>/                Per-agent config + prompt + skills
├── memory/                     Long-lived agent context
├── scripts/                    deploy.sh, invoke-agent.ts, register-agents.ts, …
└── Dockerfile                  Multi-stage Alpine build → standalone Next output
```

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

- [Anthropic](https://anthropic.com) — Claude
- [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004) — on-chain agent identity
- [x402](https://www.x402.org/) — HTTP-native USDC payments
- [Base](https://base.org) — L2 settlement
