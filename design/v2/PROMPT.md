# Kick-off prompt for Claude Code

> Copy everything below the `---` line into your first Claude Code message.
> Attach `SPEC.md`, `index.html`, `tokens.jsx`, `foundry.jsx`, and `design-canvas.jsx`
> as files (or have them committed in the repo at `design/`).

---

You are redesigning the ShipWith.AI codebase to match the **Foundry** design direction. This is a precision port, not a creative exercise. Your job is to make the production app pixel-match the reference artboard, using the tokens and anatomy defined in `SPEC.md`.

## Inputs

- **`SPEC.md`** — the implementation contract. Read it end-to-end before writing any code. Everything you need is in here: copy, type scale, color tokens, spacing, per-component anatomy, build order.
- **`index.html`** — canonical visual reference. Open it in a browser. When the spec and the artboard disagree, the artboard wins, and you flag the discrepancy as a fix to the spec in the same PR.
- **`tokens.jsx` / `foundry.jsx` / `design-canvas.jsx`** — the React source for the reference. Use these as ground truth for any measurement, color, or arrangement question.
- **The current codebase** — the live ShipWith.AI app you're rewriting. Inspect it first so you know which components map to which sections of the spec.

## Constraints

1. **Single direction.** Foundry only. No dark theme, no theme toggle, no variants.
2. **No drop shadows, no gradients, no glow, no `backdrop-filter`** in the final CSS. Grep your output for `box-shadow`, `radial-gradient`, `linear-gradient`, `filter:` — there should be zero hits in production styles.
3. **No `border-radius`** except `50%` on circular dots (signal indicators, phase dots). All cards, buttons, inputs, and avatars are square.
4. **The vermilion accent (`#A8311C`) appears only in the nine places listed in §2.1 of the spec.** Anywhere else is a bug.
5. **Inline SVG only** for the six marks listed in §5. Do not add icon libraries.
6. **Banned vocabulary** (§0.2): `constellation`, `vision`, `magic`, `AI-powered`, `revolutionary`, `seamless`, `journey`. Grep your final copy — zero hits.
7. **Real `<button>` / `<a>` elements** with visible `:focus-visible` outlines. No styled divs for interactive elements.
8. **`prefers-reduced-motion: reduce`** disables the live-dot pulse.
9. **Tabular numerals** globally: `* { font-variant-numeric: tabular-nums; }`.

## Workflow

Work through the build order in §9 of the spec, in order:

1. **Read the spec end-to-end.** Then read the current codebase. Write a short plan (no more than 20 bullets) listing every file you will change, in the order you'll change them.
2. **Tokens first.** Create `tokens.css` (or extend the existing theme module) with every variable from §2. Stop and verify by inspecting one existing page in the browser — colors should look broken in a deliberate way until the rest of the work is done.
3. **Type primitives.** Build the `Display`, `Body`, `Label`, `Mono`, `Headline` components per §9 step 2. Replace ad-hoc font declarations across the app with these.
4. **Layout primitives.** `Rule`, `VRule`, `Asterism`, `RegMark`, `Eye`.
5. **Landing page.** Compose Masthead → Hero → Offerings → InProgress → Colophon. Match the artboard. When you finish each section, open the production page and the reference artboard side-by-side at 1440px and confirm pixel parity.
6. **Workspace shell.** TopBar → LeftRail → Workspace center → RightRail → PhaseBar. Same pixel-parity check after each.
7. **Strip legacy.** Delete the radial-gradient nebula JS and any star/particle code. Grep the codebase for `radial-gradient`, `constellation`, `star`, `nebula` and remove what's left.
8. **Copy pass.** Apply the table in §0.1. Grep for banned vocabulary.
9. **QA.** Walk through the checklist in §9 step 8.

After each numbered step, **commit and push** with a message that names the step (`feat(design): step 4 — landing page`).

## Reporting back

After your initial read of the spec, before writing any code, report:

1. **One paragraph summary** of what you're about to do.
2. **The file plan** (≤ 20 bullets) of what you'll change in what order.
3. **Any spec ambiguity** — flag it and propose a resolution; don't guess.
4. **Risk list** — three things most likely to slow this down (legacy CSS conflicts, missing fonts, etc.) and your mitigation for each.

Then wait for confirmation before starting step 2.

## Definition of done

- Production page at 1440px viewport matches the reference artboard with only antialiasing-level visual delta at every named landmark (masthead, hero headline, commission card meta tables, methodology row, correspondence header, composer rule, phase bar).
- Lighthouse accessibility ≥ 95. Contrast 100.
- Zero `box-shadow` / `border-radius` (outside dots) / `radial-gradient` in compiled CSS.
- All banned vocabulary removed from rendered copy.
- Tab order and keyboard nav match §8 of the spec.
- A short `MIGRATION.md` at the repo root listing every component renamed, every legacy file deleted, and any spec discrepancies you found.

When all of the above is true, open a single PR titled `feat: Foundry redesign (1.0)` with a screenshot of the landing and workspace side-by-side with the reference artboard.

Begin by reading `SPEC.md` end-to-end and then reporting per the "Reporting back" section above.
