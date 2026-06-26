---
name: audit-report
description: Render a consolidated smart-contract audit report as a client-ready Markdown document (and structured JSON) from a set of verified findings. Use at the end of an audit engagement to produce the deliverable. Optionally styles a header using a brand theme from the brand-extract skill.
allowed-tools: Read, Write
---

# Audit Report

Turn verified audit findings into the studio's standard client deliverable: `report.md` + `report.json`.

## Inputs

- The verified findings (from the auditor's `.audit/findings/` or passed inline).
- `outDir` — where to write `report.md` and `report.json`.
- Optional brand theme (from `brand-extract`) for the header — accent color, logo, site name. Default to studio styling (ink on cream, vermilion accent) when absent.

## report.json

Mirror the structured schema the auditor produced (`status`, `summary`, `recommendation`, `findings[]`, `contractsReviewed[]`). This is the machine-readable record.

## report.md — section layout

```markdown
# Security Audit — <Project / repo name>

> <accent rule>  ShipWithAI · prepared <date passed by caller>

## Recommendation: GO | NO-GO | CONDITIONAL
<one-paragraph rationale>

## Scope
- Repository: <url / path>
- Contracts reviewed: <count> (<list>)
- Methodologies run: Feynman → Nemesis → State-Inconsistency (whichever were selected)
- Focus areas: <scope or "full contract surface">

## Findings summary
| Severity | Count |
|----------|-------|
| Critical | n |
| High | n |
| Medium | n |
| Low | n |
| Informational | n |

## Findings
For each finding, in severity order:

### <ID> · <Severity> · <Title>
**Location:** `<file:line>`
**What's wrong:** <plain-language explanation — teach it, don't name-drop bug classes>
**Verification:** <code trace / PoC evidence>
**Impact:** <what an attacker gains or what breaks>
**Recommendation:** <minimal, targeted fix>

## Methodology
Brief description of each methodology that was run and what it covers.

## Disclaimer
This audit was produced with AI assistance. It reduces risk but does not guarantee
the absence of vulnerabilities. <fixed studio disclaimer>
```

## Rules

- Order findings by severity (Critical → Informational).
- Plain language in "What's wrong" — the client may be non-technical. Save jargon for the fix.
- Never include unverified findings. If the auditor downgraded or eliminated a finding, it does not appear (or appears in an explicit "Eliminated false positives" appendix).
- A branded PDF render is a planned follow-up (was `@react-pdf/renderer` in the old web app); for now the Markdown report is the deliverable. Note this if the client asks for a PDF.
