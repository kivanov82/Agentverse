---
name: notify
description: Deliver a monitoring digest or alert through the configured channel — push notification, Slack/Teams, email, a Notion page, or file-only. Use at the end of a monitor check cycle. Keeps messages concise and actionable.
allowed-tools: Read, Bash, WebFetch
---

# Notify

Send the right message to the right place. **Alerts fire immediately; digests fire on cadence.**

## Pick the channel
From `monitor.config.json` → `notify.channel`:

- **push** — send a push notification (the `PushNotification` tool). Title = the verdict + brand (e.g. "⚠ Aether — checkout errors"), body = the one-line cause + number. Best for ALERTs.
- **slack** — POST to the incoming webhook at the env var named by `notify.slackWebhookEnv` (never hardcode the URL): `curl -fsS -X POST -H 'Content-type: application/json' -d '{"text":"…"}' "$SLACK_WEBHOOK_URL"`. Use blocks for the digest, a plain bold line for an ALERT. (Teams: the same idea with its webhook.)
- **email** — send to `notify.email` via the available mail mechanism (an MCP/CLI if connected; otherwise write the message to `monitoring/outbox/<timestamp>.md` and tell the operator to send it).
- **notion** — create a page under `notify.notionParent` with the digest (use the `Notion:create-page` skill). Good for a running log.
- **file** — write only to `monitoring/digests` / `monitoring/alerts` (already done by `monitor-run`); no external send.

## Message shape
Lead with the verdict, then the number, then the action. Examples:
- ALERT: **"🔴 Aether is down — homepage returning 503 for 6 min. Likely the origin; hand to backend-developer."**
- ALERT: **"🔴 Revenue $0 today (normally ~$3k) — 0 completed checkouts, 14 card declines. Check the Stripe key/config."**
- Digest: **"🟢 Aether — daily. Uptime 100% · revenue $4,820 (+18% WoW) · 1,240 visits (Reddit driving +30%) · rankings steady · 1 WATCH: cert renews in 18 days."**

## Rules
- **Concise + actionable** — verdict, number, cause, next step. No raw logs in the notification (link to the digest/alert file for detail).
- **No secrets** — never include keys, tokens, or full card/PII in a message; reference webhooks via env var names only.
- **Don't spam** — ALERTs only on change (new/worse/resolved); the digest only on the configured cadence. If nothing changed and it's not a digest moment, send nothing.
- Always confirm what was sent (channel + summary) back to the cycle so it's logged.
