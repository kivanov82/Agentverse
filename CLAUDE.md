# ShipWithAI

A connected network of AI agents working together as a decentralized Web3 software development company.

Brand: **ShipWithAI** (no dot). Domain: **shipwithai.nl**.

## Project Structure

```
shipwithai/
├── apps/web/              # Next.js 14 (App Router) dashboard
│   ├── app/
│   │   ├── api/           # REST API routes
│   │   │   ├── agents/    # Agent invocation
│   │   │   ├── costs/     # Token cost tracking
│   │   │   ├── deliverables/ # File delivery & download
│   │   │   ├── events/    # Event bus
│   │   │   ├── payments/  # USDC payment confirmation
│   │   │   ├── projects/  # Project management
│   │   │   ├── sessions/  # Session CRUD & messages
│   │   │   └── usage/     # Free-tier usage limits
│   │   └── dashboard/     # Main dashboard page
│   ├── components/        # React components
│   └── lib/               # Zustand store, hooks, config
├── packages/
│   ├── core/              # Shared types, events, Firestore persistence, agent runner
│   ├── orchestrator/      # Workflow coordination
│   └── x402/              # Payment integration (Base/USDC) — currently stub
├── agents/                # Individual agent configurations
│   ├── pm/                # Project Manager
│   ├── ux-analyst/
│   ├── ui-designer/
│   ├── ui-developer/      # Frontend Developer
│   ├── backend-developer/ # Integration Developer (API routes, serverless)
│   ├── solidity-developer/
│   ├── solidity-auditor/  # Includes skills/{feynman,nemesis,state-inconsistency}-auditor
│   ├── infrastructure/
│   ├── qa-tester/
│   ├── unit-tester/
│   ├── tech-writer/
│   └── marketing/
├── memory/                # Global and per-project context
├── projects/              # Project outputs
└── scripts/               # CLI utilities
```

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server (web UI at http://localhost:3000)
pnpm dev

# Invoke an agent directly
pnpm invoke pm "Plan a token launchpad project"
pnpm invoke ui-developer "Build a wallet connect button"

# Register agents with ERC-8004 (requires ETH)
pnpm register-agents --dry-run
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for agent invocation |
| `GITHUB_REPO_OWNER` | Yes | GitHub org/user for project repos |
| `GITHUB_APP_ID` | Yes | GitHub App ID for repo management |
| `GITHUB_APP_PRIVATE_KEY` | Yes | GitHub App private key |
| `GITHUB_APP_INSTALLATION_ID` | Yes | GitHub App installation ID |
| `GITHUB_PAT` | Yes | Personal access token for Git writes |
| `SHIPWITHAI_FREE_MODE` | No | `true` locally, `false` in production — bypasses payment gates |
| `NEXT_PUBLIC_SHIPWITHAI_FREE_MODE` | No | Client-visible mirror of the flag above |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Yes (local) | Path to Firestore service account JSON (ignored on Cloud Run) |
| `VERCEL_TOKEN` | No | Enables Vercel deployment tools |
| `VERCEL_TEAM_ID` | No | Vercel team scope |
| `BRAVE_SEARCH_API_KEY` | No | Enables web search tool |
| `E2B_API_KEY` | No | Enables sandbox command execution |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | No | Enables wallet connection (RainbowKit) |

When optional variables are not set, their features are gracefully disabled.

## Use Cases

Configured in `apps/web/lib/use-cases.ts` and surfaced as tiles on the home page. Each use case defines its agent team, intake questions, and PM brief template.

- **Solidity Audit** (public launch focus) — PM + solidity-auditor only. Intake: public GitHub repo URL + optional scope + optional brand URL. Runs Feynman → Nemesis → State-Inconsistency sequentially. Produces a Firestore `audit_report` deliverable with markdown + structured JSON, rendered to a branded PDF on demand.
- **Landing Page, App Prototype, E-commerce, SEO** — multi-agent dev flows (PM + designers/devs/etc).
- **Demo** — pre-scripted coffee shop build.

Use cases may set `skipGithubStep: true` when they operate on an existing user repo (audit does this) — the wizard omits the "where to save" prompt.

## Web UI Features

The Next.js dashboard (`/dashboard`) provides a unified project interface:

- **Unified Chat**: Single conversation stream for all agents — no tab switching. Agent badges show who is speaking.
- **Agent Sidebar**: Right panel showing team members with live status and per-agent cost
- **Project Timeline**: Bottom bar showing phase progress (Discovery → Design → Development → Review → Go Live) with deliverable links
- **Auto-Handoffs**: PM routes to specialists automatically — no manual button clicks. Handoff task descriptions are passed to the target agent.
- **Clickable Options**: Agents present choices as buttons instead of open-ended questions
- **Mobile Overlay**: "Designed for Desktop" screen on small viewports
- **Sessions**: Multi-agent context-building sessions with message history
- **Deliverables Tree**: Work products grouped by producing agent
- **Audit Methodology Explainer**: 3-card banner shown once per user on solidity-audit projects before the audit runs
- **Onboarding Tour**: 6-step guided overlay for new users
- **Usage Tiers**: Anonymous (10 free), connected wallet (25 free), funded (unlimited)
- **Demo Mode**: Click "Run Demo" to see a simulated multi-agent workflow

## Key Concepts

### Agents
Each agent is a specialized AI worker with:
- A system prompt (`agents/<id>/CLAUDE.md`)
- Configuration (`agents/<id>/config.json`) — model, tools, outputTool, maxIterations, optional `skills` allowlist
- Skills (`agents/<id>/skills/<folder>/SKILL.md`) — auto-loaded and appended to the system prompt
- A wallet for x402 payments
- ERC-8004 on-chain identity

### Data Layer
- **Firestore** (`packages/core/src/firestore-store.ts`) — the sole persistence layer
- Stores projects, sessions, messages, deliverables, delivery requests, usage, costs, workflows
- Type definitions live in `packages/core/src/types-stored.ts`
- State managed client-side via **Zustand** (`apps/web/lib/store.ts`) with API sync
- Deliverable content supports multiple payloads per deliverable via `docKey` — e.g. audit reports store markdown at `main` and structured JSON at `structured`

### Events
In-memory event bus (`packages/core/src/events.ts`) used by the orchestrator and project tools. Event types: `task.created/assigned/completed/failed/retrying/escalated`, `payment.sent`, `artifact.produced`, `message.sent`. For durable event history, write to a Firestore collection instead — the bus itself is not persistent.

### Brand Scraper
`packages/core/src/brand-scraper.ts` — lightweight HTML regex parser that extracts `theme-color`, primary Google Font family, `og:image`/favicon, and site name from a URL. Called once when a project is created with a `brandUrl` answer; result persisted to `project.metadata.brandTheme` and reused by downstream renderers (e.g. audit PDF).

### PDF Rendering
Audit reports render on demand at `GET /api/deliverables/[id]/pdf` via `@react-pdf/renderer` (chosen over Puppeteer so the Alpine-based Docker runner stays lean). The document template lives in `apps/web/lib/audit-pdf.tsx` — it uses the scraped `brandTheme` for accent color + logo and carries a fixed AI disclaimer footer.

### Payments
- x402 protocol for agent-to-agent payments (currently stub — see `packages/x402/`)
- USDC on Base (testnet for dev, mainnet for prod)
- RainbowKit + wagmi v2 wallet integration
- **5× markup** on Claude API costs for user-facing pricing (`apps/web/lib/pricing.ts`)
- Payment confirmation flow with on-chain transaction verification (planned)

### Workflows
The orchestrator coordinates multi-agent workflows:
1. User submits request
2. PM breaks down into tasks
3. Tasks assigned to specialists
4. Agents work and produce artifacts
5. Quality checks and payments
6. Final delivery

## Development

When working on this project:
1. Keep agent prompts focused and specific
2. Test agent interactions locally before deployment
3. Use mock payments in development
4. Document all decisions in `memory/`
5. Wallet providers are conditionally loaded — no build-time WalletConnect dependency
6. `useSearchParams()` requires `<Suspense>` boundary in Next.js 14

## Bootstrap Project

ShipWithAI is building itself! Check `projects/shipwithai-bootstrap/` for the meta-project where our agents are improving their own code.
