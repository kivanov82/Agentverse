# Handing off to Claude Code

You have three artifacts to ship to Claude Code:

| File          | What it is                                                      |
| ------------- | --------------------------------------------------------------- |
| `SPEC.md`     | The implementation contract. Tokens, anatomy, build order.      |
| `index.html`  | The canonical visual reference (plus `tokens.jsx`, `foundry.jsx`, `design-canvas.jsx`). |
| `PROMPT.md`   | A ready-to-paste kick-off prompt (this folder).                 |

---

## How to hand off

### Option A — Claude Code in your repo (recommended)

1. Make sure you have Claude Code installed: <https://docs.claude.com/en/docs/claude-code>
2. In your current ShipWith.AI repo, drop these files at the root:
   - `design/SPEC.md` ← copy from this project
   - `design/reference/index.html` ← copy this project's `index.html`
   - `design/reference/tokens.jsx`, `foundry.jsx`, `design-canvas.jsx` ← copy them too so Claude Code can read the exact React component code.
3. From the repo root, run `claude` to start a session.
4. Paste the prompt from `PROMPT.md`.
5. Let Claude Code work through the build order in §9 of the spec. Review each PR/commit.

### Option B — claude.ai/code with attached files

1. Open <https://claude.ai>.
2. New chat. Attach: `SPEC.md`, `index.html`, `tokens.jsx`, `foundry.jsx`, `design-canvas.jsx`.
3. Paste the prompt from `PROMPT.md`.
4. Claude will plan the rewrite. Ask it to output the implementation file-by-file.

### Option C — Download this whole project as a zip

You can package the entire project (spec + reference + canvas state) as a single download. I can do that for you on request (just say "package it for download"). Then attach the zip to Claude Code.

---

## What to give Claude Code on every run

- Spec: `SPEC.md`
- Reference HTML: open `index.html` in a browser; the artboards there are the source of truth for any pixel question.
- Your existing repo: Claude Code needs to see the current code so it can replace components, not start from scratch.

---

## The prompt itself

See `PROMPT.md` in this folder. It's structured so Claude Code:

1. Reads the spec end-to-end before touching code.
2. Inventories the current site (what to keep, what to replace).
3. Builds a token layer first, then primitives, then screens.
4. Diffs each completed screen against the reference artboard.
5. Stops and asks before deviating from the spec.

---

## How to know it's done

- The compiled CSS has **no** `radial-gradient`, **no** `box-shadow`, **no** `border-radius` outside circular dots.
- A side-by-side of `index.html` (reference) vs. the new production page at 1440px wide shows only antialiasing differences at the masthead, hero, commission cards, methodology row, and phase bar.
- The banned-vocabulary grep from §0.2 returns zero hits in copy.
- Tab order matches §8.
