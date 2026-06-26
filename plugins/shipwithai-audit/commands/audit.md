---
description: Run a smart-contract security audit engagement — guided intake, local clone, methodologies, client report.
argument-hint: "[repo-url] [--depth quick|standard|full] [focus notes...]"
intake_questions:
  - id: repoUrl
    prompt: "Which GitHub repo holds the contracts?"
    type: url
    required: true
  - id: depth
    prompt: "How deep should we audit?"
    type: choice
    required: true
    options:
      - { label: "Standard — Feynman + Nemesis", value: standard, recommended: true }
      - { label: "Quick — Feynman only", value: quick }
      - { label: "Full — all three + adversarial verification", value: full }
  - id: scope
    prompt: "Anything specific to focus on? (e.g. the staking contract, the upgrade path)"
    type: text
    required: false
  - id: brandUrl
    prompt: "Your website URL, so we match your brand on the report"
    type: url
    required: false
---

# /audit — smart-contract audit engagement

A guided audit engagement, start to finish, entirely local. This command is the **reference wizard** every `ship-with-ai-*` vertical follows: intake → set up → run → deliverable → report back.

**Anything the client already provided:** `$ARGUMENTS`

## Step 1 — Intake (the wizard)

Run the core **`intake`** convention against this command's **`intake_questions`** frontmatter — that YAML list is the single source of truth for the wizard. First pre-fill from `$ARGUMENTS` (first URL-looking token → `repoUrl`; `--depth X` → `depth`; remaining free text → `scope`), then ask only what's still missing (depth as a clickable choice, the optional free-text in one short message).

Map `depth` → methodologies: **quick** → `feynman-auditor`; **standard** → `feynman-auditor`, `nemesis-auditor`; **full** → all three.

## Step 2 — Set up the engagement

Build a collision-proof slug: **`<repo-owner>-<repo-name>-<YYYYMMDD>`** (owner + name parsed from the repo URL; date from `date +%Y%m%d`). Shallow-clone the target into the engagement dir:

```
git clone --depth 1 <repoUrl> engagements/<slug>/repo
```

Write the intake brief to `engagements/<slug>/brief.md`, and append an entry to `engagements/index.json` (create the file with `[]` if absent) recording `{ "slug", "vertical": "audit", "repoUrl", "depth", "date", "status": "active" }`. This index is the studio's engagement registry — check it before starting in case the engagement already exists (resume rather than clobber).

## Step 3 — Brand (optional)

If `brandUrl` was given, run the **`brand-extract`** skill on it and keep the returned theme (accent color, font, logo, site name) for the report header.

## Step 4 — Run the audit

- **Quick / Standard** → delegate to the **`solidity-auditor`** subagent via the `Agent` tool. Pass it:
  - `repoDir` = `engagements/<slug>/repo`
  - `scope` (from intake)
  - `methodologies` = the selected skill ids **with their paths**: `${CLAUDE_PLUGIN_ROOT}/skills/<id>/SKILL.md`
  - `outDir` = `engagements/<slug>`
  - the brand theme (if any)
- **Full** → run the deep workflow: call the `Workflow` tool with
  `scriptPath: "${CLAUDE_PLUGIN_ROOT}/workflows/audit.js"` and
  `args: { repoDir, scope, pluginRoot: "${CLAUDE_PLUGIN_ROOT}", outDir, selected: [<skill ids>] }`.
  It fans out the methodologies and adversarially verifies every Critical/High/Medium finding.

## Step 5 — Deliverable

Confirm `engagements/<slug>/report.json` and `report.md` exist. If only the JSON does, invoke the **`audit-report`** skill to render `report.md`, applying the brand theme.

## Step 6 — Report back

In plain language: the **Go / No-Go / Conditional** recommendation, the finding count by severity, the 1–2 most serious issues, and the path to the full report. No internal jargon. Then mark the engagement `"status": "complete"` in `engagements/index.json`.

## Notes

- Client code is cloned into gitignored `engagements/` — never uploaded.
- Billing is per engagement, handled outside this tool.
- Non-Solidity on-chain code (Move, Rust/Anchor) works too — the methodologies are language-agnostic; the auditor adapts terminology.
