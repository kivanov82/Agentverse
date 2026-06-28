---
name: monitor-setup
description: Stand up a monitoring config for a launched engagement — write monitor.config.json (target, enabled monitors, thresholds, cadence, notify channel, integration hints) and wire the 24/7 scheduled check cycle. Use at the start of a /monitor engagement.
allowed-tools: Read, Write, Edit, Bash
---

# Monitor Setup

Turn the intake answers into a durable monitoring config + a recurring schedule.

## 1. Write `engagements/<slug>/monitoring/monitor.config.json`

```json
{
  "slug": "<slug>",
  "target": "https://example.com",
  "monitors": ["tech", "sales", "visitors"],
  "cadence": "daily",
  "channel": "push",
  "thresholds": {
    "latencyMsWatch": 1500,
    "errorRatePct": 2,
    "certDaysWatch": 21,
    "certDaysAlert": 7,
    "revenueDropPct": 30,
    "trafficDropPct": 40
  },
  "integrations": {
    "repo": "<path-or-url, for security/deps>",
    "stripe": "<account hint / test|live>",
    "analytics": { "type": "ga4|plausible", "id": "<property/site>" },
    "keywords": ["<tracked SEO terms>"],
    "brandTerms": ["<brand + product names>"]
  },
  "notify": { "channel": "push", "slackWebhookEnv": "SLACK_WEBHOOK_URL", "email": null, "notionParent": null }
}
```
- Only include the `monitors` the user enabled; only fill `integrations` that exist (leave the rest `null` — the specialist will degrade gracefully and report `unknown`).
- **Credentials live in the environment, never in this file** — store only env-var *names* / non-secret hints (account ids, property ids).
- Seed an empty `engagements/<slug>/monitoring/baseline.json` (`{}`) — the first check cycle fills it.

## 2. Wire the 24/7 schedule
Each cadence firing runs one check cycle by invoking the command in check-mode:
`/shipwithai-monitor:monitor --check <slug>`

Use the **`schedule`** skill to create a recurring cloud agent (routine) on the chosen cadence:
- `hourly` → tech-critical watch (uptime/security lean).
- `daily` → the standard digest (recommended).
- `weekly` → a roll-up.

If the operator prefers to run it themselves, give them the one command to set the routine, and note they can also run `--check <slug>` manually anytime. Record the routine id/cadence in the config (`"schedule": {"cadence":"daily","routineId":"…"}`) so it can be paused/updated later.

## 3. Confirm
Echo back, in plain language: what's watched, how often, where alerts/digests go, and that the first cycle runs next (step 4 of the command). Append `{ slug, vertical: "monitor", target, date, status: "active" }` to `engagements/index.json` if not already present.
