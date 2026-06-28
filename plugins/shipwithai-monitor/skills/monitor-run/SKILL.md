---
name: monitor-run
description: Run one monitoring check cycle — fan out the enabled monitor specialists, collect their OK/WATCH/ALERT findings, update the baseline, and write a digest + any alerts. Use each time the schedule fires (or for a manual --check).
allowed-tools: Read, Write, Edit, Bash
---

# Monitor Run (one check cycle)

A single pass over a monitored engagement. Keep it cheap — this runs on a schedule, potentially hourly.

## Steps
1. **Load state.** Read `engagements/<slug>/monitoring/monitor.config.json` and `monitoring/baseline.json`. Bail clearly if the config is missing (the engagement isn't set up).
2. **Fan out the enabled monitors** (via the `Agent` tool — independent ones in parallel):
   - `tech` → **uptime-sentinel** · `sales` → **revenue-analyst** · `visitors` → **traffic-analyst** · `seo` → **seo-rank-watch** · `security` → **security-watch** · `reputation` → **reputation-watch**.
   - Pass each: the `slug`, the config, and the baseline path. Each returns a compact block — `verdict: OK|WATCH|ALERT`, headline metric(s), the delta vs baseline, and a suggested action — and updates its own slice of `baseline.json`.
3. **Aggregate.** Overall cycle verdict = the worst of the parts. Build a digest:
   - `monitoring/digests/<YYYY-MM-DD>.md` — one section per monitor with status + key numbers (include OK lines so "all green" is visible), a top-line summary, and a short "what changed since last cycle".
4. **Raise alerts.** For every `ALERT` (and optionally `WATCH` if the config opts in), write `monitoring/alerts/<timestamp>-<monitor>.md` with the finding, the number, the likely cause, and the hand-off target (which build vertical fixes it).
5. **Update the baseline.** Persist current values + rolling averages to `baseline.json` so next cycle can diff. Mark known-accepted issues so they don't re-alert.
6. **Notify.** Hand the digest + alerts to the **`notify`** skill: ALERTs go out immediately every cycle; the full digest goes out on the configured `cadence` (don't spam a daily digest on an hourly run — send the digest only on the day's first/last run as configured, alerts always).

## Cost & noise discipline
- Only run the enabled monitors; skip a monitor whose integration is absent (report `unknown` once, not every cycle).
- Dedupe against the last cycle — re-alerting the same unchanged issue is noise. Alert on **change** (new, worsened, or resolved), not on steady-state.
- Keep specialist prompts tight; this is recurring spend.

## Output
The deliverables are files in `engagements/<slug>/monitoring/`: the dated digest, any alerts, and the updated baseline. Return a one-line cycle summary (e.g. "Cycle OK — uptime green, revenue +18% WoW, 1 WATCH: cert renews in 18 days").
