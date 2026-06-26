---
description: Audit a site for SEO and produce an actionable optimization plan — issues, keyword research, competitor analysis, content recommendations.
argument-hint: "[site-url] [focus notes...]"
intake_questions:
  - id: url
    prompt: "What's the website URL to optimize?"
    type: url
    required: true
  - id: business
    prompt: "In a few sentences, what does the business do?"
    type: text
    required: true
  - id: competitors
    prompt: "Main competitors? (optional)"
    type: text
    required: false
---

# /seo — SEO optimization engagement

Audit a site and deliver an actionable SEO plan, entirely local.

**Already provided:** `$ARGUMENTS`

## Step 1 — Intake
Run the core **`intake`** convention against this command's `intake_questions`. Pre-fill from `$ARGUMENTS` (first URL → `url`; remaining text → `business`/focus).

## Step 2 — Set up the engagement
Slug = `<domain>-seo-<YYYYMMDD>`. `mkdir -p engagements/<slug>`. Write `brief.md` and append `{ slug, vertical: "seo", url, date, status: "active" }` to `engagements/index.json`.

## Step 3 — Run the team (via the `Agent` tool)
1. **seo-specialist** — technical + on-page audit of `url` (fetch the site; check titles, meta, headings, structured data, performance signals, indexability), keyword research, and competitor gap analysis. Write findings to `engagements/<slug>/`.
2. **ux-analyst** — UX/conversion issues that affect SEO (navigation, content hierarchy, CWV-adjacent UX).
3. **tech-writer** — content recommendations: priority pages, briefs, and on-page copy improvements.

## Step 4 — Deliverable
Consolidate into `engagements/<slug>/seo-report.md`: executive summary, prioritized issues (with severity + effort), keyword plan (table), competitor gaps, and a content roadmap. Include a machine-readable `seo-report.json` for the headline metrics.

## Step 5 — Report back
Plain language: the top 3 wins, the headline keyword opportunities, and the path to the full report. Mark the engagement `status: "complete"` in `engagements/index.json`.
