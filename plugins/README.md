# ShipWithAI — local-first delivery studio

ShipWithAI runs its fleet of specialist agents **locally, inside Claude Code**, to produce client deliverables (security audits, web builds, growth work, marketing video). Each vertical is packaged as a Claude Code **plugin**; this repo is a local plugin **marketplace**.

> This replaces the hosted multi-agent web SaaS. The agent prompts and methodologies are the IP and carry over; the bespoke runtime (`packages/core`, Firestore, payment rails, `apps/web`) is being retired. Billing is handled per engagement, individually — not automated.

## Layout

```
.claude-plugin/marketplace.json     # catalog of the studio's plugins
plugins/
  shipwithai-core/                  # shared: PM coordinator + reusable skills (intake wizard, brand-extract)
  shipwithai-audit/                 # smart-contract audit vertical
    agents/solidity-auditor.md
    skills/{feynman,nemesis,state-inconsistency}-auditor/   # the methodologies
    skills/audit-report/            # deliverable format
    commands/audit.md               # /audit entry point
    workflows/audit.js              # deep parallel + adversarial-verify orchestration
engagements/                        # per-client working dirs (gitignored)
```

Planned verticals: `shipwithai-web` (landing / app / e-commerce), `shipwithai-growth` (SEO / marketing / docs), `shipwithai-video` (Remotion promo videos).

## Enable the studio locally

The studio is **pre-wired** in `.claude/settings.json` (`extraKnownMarketplaces` registers the local `shipwithai` marketplace, `enabledPlugins` turns the verticals on) — so you don't type any `/plugin` commands. On first open of this repo, Claude Code asks you to trust the workspace and offers to install the local marketplace + its plugins; accept once (a security step that can't be bypassed) and the commands are live. Everything loads straight from `./plugins/` on disk — nothing is published.

Fallback, if the auto-offer doesn't appear:

```
/plugin marketplace add .
/plugin install shipwithai-core
/plugin install shipwithai-audit
```

Then run an engagement, e.g.:

```
/shipwithai-audit:audit https://github.com/acme/contracts --depth full focus on the staking + upgrade path
```

Depth: `quick` (Feynman) · `standard` (Feynman + Nemesis) · `full` (all three + adversarial verification via the workflow).

## Note: the pre-commit Bash hook (removed)

`.claude/settings.local.json` previously had a `PreToolUse` hook (matcher `Bash`) that spawned a code-review agent and could **deny** the call. It was meant to gate commits but matched **every** Bash command, so it blocked `git clone`, `forge test`, and other audit steps — it has been **removed**. If you want a commit-time quality gate back, re-add it scoped to git commit/push commands only (match on `input.command`), not a blanket `Bash` matcher.
