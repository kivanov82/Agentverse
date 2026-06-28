---
description: Stand up 24/7 post-launch monitoring + alerting for a live site/store — tech uptime, sales, traffic, SEO, security, reputation. Produces a monitoring config, scheduled check cycles, and digests/alerts.
argument-hint: "[live-url] [--every hourly|daily|weekly] [--check <slug>]"
intake_questions:
  - id: target
    prompt: "What's the live URL to monitor?"
    type: url
    required: true
  - id: monitors
    prompt: "What should we watch?"
    type: choice
    required: true
    multi: true
    options:
      - { label: "Tech / uptime", value: tech, recommended: true }
      - { label: "Sales (Stripe)", value: sales, recommended: true }
      - { label: "Visitors (analytics)", value: visitors, recommended: true }
      - { label: "SEO / rankings", value: seo }
      - { label: "Security", value: security }
      - { label: "Reputation / brand", value: reputation }
  - id: cadence
    prompt: "How often should we check?"
    type: choice
    required: true
    options:
      - { label: "Daily digest", value: daily, recommended: true }
      - { label: "Hourly (tech-critical)", value: hourly }
      - { label: "Weekly", value: weekly }
  - id: channel
    prompt: "Where should alerts + digests go?"
    type: choice
    required: true
    options:
      - { label: "Push notification", value: push, recommended: true }
      - { label: "Slack / Teams", value: slack }
      - { label: "Email", value: email }
      - { label: "Notion page", value: notion }
      - { label: "File only (in the engagement)", value: file }
  - id: stack
    prompt: "Anything we should know? (Stripe account, analytics property, repo, the engagement this launched from)"
    type: text
    required: false
---

# /monitor — post-launch monitoring engagement

Keep watching after go-live. A standing fleet of monitor agents turns live signals into a digest on a schedule and an **alert the moment something breaks** — entirely local, billed per engagement.

**Already provided:** `$ARGUMENTS`

## Two modes
- **Setup (default):** no `--check` → run intake and stand up monitoring (steps 1–5).
- **Check cycle:** `--check <slug>` (what the scheduled routine calls) → skip intake, run **one** cycle against that engagement's `monitor.config.json` (jump to step 4).

## Step 1 — Intake
Run the core **`intake`** convention against this command's `intake_questions`. Pre-fill from `$ARGUMENTS` (first URL → `target`; `--every X` → `cadence`). `monitors` is multi-select.

## Step 2 — Set up the engagement
Slug = `<domain>-monitor-<YYYYMMDD>` (or reuse the launched engagement's slug + `/monitoring`). `mkdir -p engagements/<slug>/monitoring/{digests,alerts}`. Use the **`monitor-setup`** skill to write `engagements/<slug>/monitoring/monitor.config.json` (target, enabled monitors, thresholds, cadence, channel, integration hints). Append `{ slug, vertical: "monitor", target, date, status: "active" }` to `engagements/index.json`.

## Step 3 — Wire 24/7 scheduling
Set up a recurring check via Claude Code's scheduled cloud agents: a routine that runs `/shipwithai-monitor:monitor --check <slug>` on the chosen `cadence`. Use the **`schedule`** skill (or tell the operator the one command to run). Each firing executes step 4 and notifies only when there's something to say (alerts always; digests on cadence).

## Step 4 — Run a check cycle
Use the **`monitor-run`** skill. For each enabled monitor, delegate to its specialist (via the `Agent` tool), one or in parallel:
- **tech** → `uptime-sentinel` · **sales** → `revenue-analyst` · **visitors** → `traffic-analyst` · **seo** → `seo-rank-watch` · **security** → `security-watch` · **reputation** → `reputation-watch`.
Each reads `monitor.config.json` + `monitoring/baseline.json`, gathers current metrics, compares to baseline/thresholds, and returns findings tagged **OK / WATCH / ALERT** with a one-line summary + numbers. Update `baseline.json`, write `monitoring/digests/<date>.md`, and any `monitoring/alerts/<timestamp>.md`.

## Step 5 — Notify + report
Use the **`notify`** skill to deliver via the configured `channel`: **ALERTs immediately**, the **digest** on cadence. Keep it concise and actionable (what changed, the number, the likely cause, the suggested fix). Then report back in plain language: what's watched, the cadence, where alerts go, the first digest path, and the live status. Keep the engagement `status: "active"` (monitoring is ongoing; mark `paused`/`complete` when stood down).

## Notes
- **Read-only by default** — monitors observe and report; they never change the live site. A fix is a hand-off to the right build vertical, not an autonomous edit.
- **Honest signals only** — report real metrics from real sources; if a source isn't connected (no analytics creds, no Stripe), say so and degrade gracefully rather than inventing numbers.
- **No secrets on screen / in commits** — credentials stay in the environment; `monitoring/` holds metrics + config, never keys. Client data stays in the gitignored engagement dir.
