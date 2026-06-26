---
name: intake
description: Run an engagement intake "wizard" for a delivery vertical. Given a declared list of intake questions, gather answers (clickable choices via AskUserQuestion, free-text conversationally, skipping anything already supplied as command args), then emit a normalized engagement brief the specialists consume. Use at the start of any ship-with-ai-* vertical command.
allowed-tools: AskUserQuestion, Read, Write
---

# Engagement Intake

Standardizes how every ShipWithAI vertical greets a client and gathers the critical inputs before work starts. This is the local-first port of the old web wizard (`use-cases.ts` `questions[]` + `pmBriefTemplate`).

## Inputs

The calling command declares its questions in its **`intake_questions`** frontmatter — a YAML list that is the single source of truth (the local-first equivalent of the old `use-cases.ts` `questions[]`). Read it from the command file; do not invent questions the command didn't declare. Each entry:

- `id` — key in the resulting brief
- `prompt` — what to ask
- `type` — `choice` | `text` | `url` | `file`
- `required` — true / false
- `options` — for `choice`: 2–4 labelled options, one marked `recommended: true`
- a pre-filled value — from a command arg or earlier conversation, if already known (skip the question)

## Protocol

1. **Skip what you already have.** If a question's `value` is already supplied (from command args or earlier in the conversation), don't ask it again.
2. **Choices → clickable.** Batch all `choice` questions (up to 4) into a single `AskUserQuestion` call. Put the recommended option first, labelled "(Recommended)".
3. **Free-text → conversational.** Ask `text` / `url` / `file` questions in one short message; group the optional ones and let the client say "skip".
4. **One pass, minimal round-trips.** Ask only what's missing. Mirror the studio voice — concise, plain language, offer choices not open questions. Never dump a wall of questions.
5. **Don't over-confirm.** Once the required answers are in, proceed. Don't ask "ready?".

## Output — the engagement brief

Produce a normalized brief and, if the caller passes an `outDir`, write it to `<outDir>/brief.md`:

```json
{
  "vertical": "<id>",
  "answers": { "<id>": "<value>", "...": "..." },
  "brief": "<one-paragraph plain-language restatement of the deliverable, scope, and constraints>"
}
```

The `brief` string is the equivalent of the old `pmBriefTemplate` — a tight statement the specialist or workflow uses as its starting context. Hand it on; don't make the specialist re-derive the ask.
