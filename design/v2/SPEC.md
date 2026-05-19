# ShipWith.AI — Foundry Implementation Spec

> **Audience.** Claude Code (or a human engineer). This document is the contract for porting the design in `index.html` → production, **1:1**.
> **Direction.** Foundry only — cream paper, deep ink, single vermilion accent. No dark theme, no toggle, no variants. One system, executed precisely.
> **Reference.** `index.html` in this project is canonical. When this document and the artboard disagree, the artboard wins — file a fix to this doc.

---

## 0. Positioning & copy

ShipWith.AI is **an atelier of specialist agents you commission**, not a chatbot framework. Every UI string follows from that frame.

### 0.1 Verbatim copy replacements

| Location                         | Before                                                       | After                                                                          |
| -------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Landing hero                     | "What do you want to build?"                                 | `Ship` newline `it.` — period in accent, "it" italic                           |
| Landing eyebrow                  | (none)                                                       | `✻ THE COMMISSION · 01`                                                        |
| Landing standfirst               | "Describe your vision. A constellation of AI specialists…"   | "A studio of specialist agents — auditors, analysts, engineers — held on retainer. *State the work.* We deliver the audit, the rewrite, the deploy." |
| Hero primary CTA                 | (none / implicit)                                            | `Brief a project →`                                                            |
| Offerings header                 | (none)                                                       | `TODAY'S COMMISSIONS` · right-aligned `02 · OFFERINGS` mono                    |
| Card CTA                         | "COMMISSION →"                                               | Same words, restyled per §4.3                                                  |
| Continue-your-project section    | "Continue your project"                                      | `IN PROGRESS · YOUR FOLIOS`                                                    |
| Workspace top center             | "Observatory"                                                | Keep `OBSERVATORY` (small caps)                                                |
| Workspace right rail header      | "Team · 2/2"                                                 | `IN RESIDENCE` · mono `2/2`                                                    |
| Methodology section              | "How we audit"                                               | `How we audit.` (display, with period)                                         |
| Composer placeholder             | "Message Project…"                                           | "Type a direction, ask a question, or attach a file…" (italic display)         |
| Footer                           | "AI AGENTS / YOUR PROJECT, YOUR CODE, YOUR REPO"             | Colophon: `✻ COLOPHON · SET IN NEWSREADER & GEIST · PRINTED ON THE WEB` + `SHIPWITHAI.NL` right |

### 0.2 Banned vocabulary

`constellation`, `vision`, `magic`, `AI-powered`, `revolutionary`, `seamless`, `journey`. These leak the AI-startup template feel the redesign is leaving behind.

---

## 1. Type system

Loaded once from Google Fonts:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link
  href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..700;1,6..72,200..700&family=Geist:wght@300..700&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet">
```

### 1.1 Families & roles

| Token            | Family         | Use                                              |
| ---------------- | -------------- | ------------------------------------------------ |
| `--font-display` | Newsreader     | Headlines, project names, message body prose    |
| `--font-ui`      | Geist          | All UI text, buttons, table values               |
| `--font-mono`    | JetBrains Mono | Timestamps, addresses, amounts, system metadata |

**Global rules** (apply once at the root):

```css
* { font-variant-numeric: tabular-nums; }
body { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
.display { font-optical-sizing: auto; }   /* enables Newsreader's opsz axis */
```

### 1.2 Type scale

| Token         | Size  | Line | Tracking | Weight | Family   | Where it appears                                  |
| ------------- | ----- | ---- | -------- | ------ | -------- | ------------------------------------------------- |
| `display-xl`  | 220px | 0.86 | -0.045em | 300    | display  | Hero "Ship it."                                   |
| `display-m`   | 56px  | 1.0  | -0.03em  | 400    | display  | (reserved for future section H1s)                 |
| `display-s`   | 38px  | 1.05 | -0.02em  | 400    | display  | Commission card titles                            |
| `display-xs`  | 34px  | 1.1  | -0.02em  | 400    | display  | Workspace H2 ("How we audit.")                    |
| `heading-l`   | 24px  | 1.35 | -0.005em | 400    | display  | Landing standfirst                                |
| `heading-m`   | 22px  | 1.35 | -0.005em | 400    | display  | (reserved)                                        |
| `heading-s`   | 19px  | 1.15 | -0.01em  | 400    | display  | Methodology card title                            |
| `body-l`      | 17px  | 1.55 | 0        | 400    | display  | Message prose, workspace lede                     |
| `meta-l`      | 20px  | 1.2  | -0.01em  | 400    | display  | In-progress row name                              |
| `meta-m`      | 16px  | 1.1  | 0        | 400    | display  | Right-rail agent name                             |
| `body-m`      | 15px  | 1.5  | 0        | 400    | ui       | Sidebar folio names                               |
| `body-s`      | 14px  | 1.55 | 0        | 400    | ui       | Card description                                  |
| `body-xs`     | 13px  | 1.55 | 0        | 400    | ui       | Meta values, secondary UI                         |
| `label-l`     | 11px  | 1.2  | 0.24em   | 600    | ui       | Small-caps eyebrows                               |
| `label-m`     | 10px  | 1.2  | 0.22em   | 500    | ui       | Small-caps muted labels                           |
| `label-xs`    | 9px   | 1.2  | 0.20em   | 500    | ui       | Tiny labels (role beneath agent name)             |
| `mono-l`      | 12px  | 1.4  | 0.05em   | 400    | mono     | Amounts, primary data                             |
| `mono-m`      | 11px  | 1.4  | 0.18em   | 400    | mono     | Mono labels (uppercase)                           |
| `mono-s`      | 10px  | 1.4  | 0.22em   | 400    | mono     | Tiny dataline (timestamps, hex)                   |

**Newsreader weights used**: 200, 300, 400 — and **italic 300/400** for "it.", roman numerals, project names in non-active sidebar rows. Don't use 500+ on Newsreader — it loses its editorial silhouette.

### 1.3 Editorial typographic rules

- Headlines with one emphasized word render that word in **italic 300** and follow it with a period in **`--accent`**. (E.g. "Ship _it_.")
- Roman numerals at the start of cards/methodologies are **italic 300 in `--accent`**, followed by a period and a non-breaking space.
- Small-caps labels are `text-transform: uppercase` + tracked Geist. They are never an italic serif.
- Quotes use proper `" "` and `' '`. Em-dashes for parentheticals, never `--`.
- "USDC", "CET", and other unit/code suffixes always render in `--font-mono`.

---

## 2. Color tokens

Define once on `:root`. There is no dark theme.

```css
:root {
  /* Surfaces */
  --surface:        #F1ECE2;    /* page background (warm cream) */
  --surface-2:      #E9E2D4;    /* inset surfaces (phase bar) */
  --card:           #F6F2EA;    /* reserved; cards are usually transparent */

  /* Ink */
  --ink:            #1A1612;    /* primary text, primary button bg, ink rules */
  --ink-2:          #4D453B;    /* secondary text */
  --ink-mute:       #857C6E;    /* tertiary text, metadata, decorative */

  /* Lines */
  --hairline:        rgba(26, 22, 18, 0.16);   /* primary 1px rules */
  --hairline-faint:  rgba(26, 22, 18, 0.08);   /* internal dividers */
  --hover:           rgba(26, 22, 18, 0.04);   /* hover / active tint */

  /* Accent */
  --accent:         #A8311C;                   /* vermilion */
  --accent-soft:    rgba(168, 49, 28, 0.10);   /* accent backgrounds */

  /* Signal */
  --signal:         #3E6F4A;                   /* live / online dot */
}
```

### 2.1 Where the accent is allowed

The vermilion appears in **exactly these places**:
1. The period at the end of `Ship it.` (and equivalent emphasis periods).
2. Roman numerals at the start of any list (`I.`, `II.`, `III.`).
3. The `→` arrow + `COMMISSION` label inside commission cards.
4. The asterism dots in eyebrow labels.
5. The wordmark `.AI` suffix.
6. The 2px left border on the active sidebar row.
7. Active-state phase dot (filled, with white checkmark for done).
8. The `+ TOP UP` mono control in the left rail.
9. Underlined inline links inside message prose.

If the accent shows up anywhere else, it's wrong. The system gets its color discipline from this constraint.

### 2.2 Forbidden

- **No drop shadows.** Separation comes from 1px hairlines.
- **No gradients, no glow, no blur, no `backdrop-filter`.** Strip the existing nebula JS.
- **No purple / teal / multi-color agent badges.** Avatar tiles are solid `--ink` with mono initials in `--surface`. (Color-by-role is the bug that makes the current site feel random.)
- **No border-radius** except `50%` on circular dots. All cards, buttons, inputs, avatars, badges are square. This is load-bearing — don't soften it later.

---

## 3. Spacing & layout

Spacing scale (px), used everywhere — `padding`, `margin`, `gap`:
`4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 56, 64, 80, 96, 120, 160`.

| Measurement                       | Value   |
| --------------------------------- | ------- |
| Landing page outer gutter         | 96px    |
| Landing hero top padding          | 88px    |
| Workspace top bar                 | 56px tall · `0 24px` padding   |
| Workspace inner grid columns      | `240px / 1fr / 280px`          |
| Workspace center inner padding    | `28px 56px`                     |
| Workspace composer padding        | `16px 56px 20px`                |
| Left/right rail padding           | `24px 20px`                     |
| Phase bar                         | 52px tall · `14px 32px` padding |
| Avatar tile (chat header)         | 28×28                           |
| Avatar tile (right rail)          | 32×32                           |
| Phase dot                         | 20×20 circle                    |
| Send button                       | 32×32                           |

---

## 4. Component anatomy

### 4.1 Masthead

```
┌───────────────────────────────────────────────────────────────┐
│ ⊕ ShipWith.AI            MAY · XIX · MMXXVI    VOL III · 14   │
└───────────────────────────────────────────────────────────────┘
```

- 56px tall · `0 32px` padding · bottom `1px solid var(--hairline)`.
- CSS Grid: `1fr auto 1fr` so the center is optically centered.
- **Left**: 16px RegMark SVG + Newsreader **italic 21px / 400** wordmark. `.AI` colored `--accent`.
- **Center**: `mono-m` color `--ink-2`, content `MAY · XIX · MMXXVI` (roman date).
- **Right**: `mono-m` color `--ink-2`, content `VOL III · ISSUE 14`.

### 4.2 Hero (landing)

Two equal columns, **64px gap**, sides **96px**, top **88px**.

**Left column** — headline stack:
1. Eyebrow row, marginBottom 28px: 10px Asterism (`--accent`) + 12px gap + `label-l` text "THE COMMISSION · 01" in `--ink-2`.
2. `<h1>` `display-xl` weight 300, `--ink`. Two lines: literal `Ship` / italic `it`. The trailing `.` is its own span colored `--accent`.

**Right column** — standfirst stack (paddingTop 32px):
1. Divider row, marginBottom 18px: 32px ink rule + 10px gap + `label-l` "STANDFIRST" in `--ink`.
2. Standfirst paragraph: `heading-l` (24px), Newsreader 400, `--ink`, max-width 460px, `text-wrap: pretty`. Emphasized phrase `<em>State the work.</em>` renders in italic 400.
3. CTA row, marginTop 48px: primary button + helper text.

**Primary button**:
- Square. Padding `14px 22px`. Background `--ink`, color `--surface`.
- Geist 14px / 500 / letter-spacing 0.02em. Trailing `→` 18px, gap 12px.
- Hover: background opacity → 0.92. No transform.

### 4.3 Commission cards (offerings)

Wrapping container:
- Section header row: `label-l` "TODAY'S COMMISSIONS" left, `mono-m` "02 · OFFERINGS" right. marginBottom 28px.
- Card grid wrapped in `border-top: 1px var(--ink)` and `border-bottom: 1px var(--ink)`. Two equal columns, separated by a vertical `1px var(--hairline)`.

Each card — padding `28px 32px 32px`:

1. Header row (justify-between, baseline-aligned, marginBottom 14px):
   - Roman numeral: Newsreader **italic 22 / 400** in `--accent`. Followed by a period.
   - Index right: `mono-s` "01 / 02" in `--ink-mute`.
2. Title: `display-s` (38px), `--ink`. marginBottom 12px.
3. Description: `body-s`, `--ink-2`, max-width 460px, `text-wrap: pretty`. marginBottom 24px.
4. Metadata table — three rows. Each row: two-column grid `110px 1fr`, padding `10px 0`. Rows 2 & 3 get `border-top: 1px var(--hairline-faint)`.
   - Left cell: `label-m` in `--ink-mute`. Labels: **Scope**, **Lead**, **Turnaround**.
   - Right cell: Geist 13px in `--ink`.
   - Values for Solidity Audit: `Feynman · Nemesis · State` / `Security Auditor` / `≈ 48h · 0.25 USDC`.
   - Values for SEO Optimization: `Technical · Content · Schema` / `Growth Analyst` / `≈ 72h · 0.40 USDC`.
5. Footer CTA row (marginTop 28px): 24px accent rule + 10px gap + `label-l` "COMMISSION" in `--accent` + `→` arrow at right.

**Hover**: card background tints `--hover` (background-color 120ms ease). Cursor `pointer`. No scale, no shadow.

### 4.4 In Progress list (landing)

- Section header: `label-l` "IN PROGRESS · YOUR FOLIOS" left, `mono-m` "01 · OPEN" right.
- Top: `1px var(--hairline)`.
- Each row: grid `24px 1fr 1fr 140px 80px` · gap 16px · padding `18px 0` · bottom `1px var(--hairline-faint)`.
  - Col 1: index `mono-m` `--ink-mute`.
  - Col 2: project name `meta-l` (display 20px) `--ink`.
  - Col 3: 6px signal dot + `label-m` status `--ink-2`.
  - Col 4: `mono-m` "opened 28d ago" `--ink-mute`.
  - Col 5: `mono-l` amount `--ink`, text-align right.

### 4.5 Workspace top bar

Same height/border treatment as masthead.

- Left cluster: RegMark 16px + wordmark Newsreader italic 19px + 18px vertical hairline (1px) + `label-m` "FOLIO · SOLIDITY AUDIT" in `--ink-2`.
- Center: 14px Eye SVG + `label-l` "OBSERVATORY" weight 600 in `--ink`.
- Right: 7px `--signal` dot + `label-m` "LIVE" in `--ink`. (No glow.)

### 4.6 Left rail (workspace)

Three blocks separated by 28px gap + a `--hairline-faint` rule between.

**Account block**:
- `label-m` "ACCOUNT · K".
- Balance row (baseline): display 30px `--ink` "$1.35" + `mono-s` "USDC".
- Footer row (space-between): `mono-s` "+ TOP UP" in `--ink-2` · `mono-s` truncated wallet "0x4f…2a91" in `--ink-mute`.

**Folios block**:
- Header (justify-between, marginBottom 14px): `label-m` "FOLIOS" + 15px `+` glyph in `--ink-mute`.
- Each folio row: padding `10px 12px`, negative-margin `-12px` to bleed full-width.
  - Active row: `background: var(--hover)` + `border-left: 2px solid var(--accent)`. Folio name in **roman** display 15px.
  - Inactive row: transparent bg, 2px transparent left border (to prevent jump). Folio name in **italic** display 15px.
  - Right: `mono-s` days-ago in `--ink-mute`.

**Workshop block**:
- `label-m` "WORKSHOP".
- Nav items (Agents · Project · Ledger): 8px 12px padding, same active-vs-inactive border + bg treatment as folios, but body 13px Geist (500 if active, 400 + `--ink-2` if not).

### 4.7 Folio header (workspace center)

- Eyebrow: 9px Asterism `--accent` + 12px gap + `label-m` "FOLIO I · THE METHOD" in `--ink-2`. marginBottom 8px.
- `<h2>` `display-xs` (34px) `--ink`. Trailing period not colored.
- Lede paragraph: `body-l` 17px Newsreader, `--ink-2`, max-width 640px, `text-wrap: pretty`. marginTop 12px.

### 4.8 Methodology row (three columns)

- Wrapping container: `border-top: 1px var(--ink)`, `border-bottom: 1px var(--hairline)`.
- Three equal columns, separated by `1px var(--hairline-faint)`.
- Each column: padding `20px 22px 22px`.
  - Header (gap 8px): italic display 15px Roman in `--accent` + display 19px (line-height 1.15) name in `--ink`.
  - Body: Geist 13px line-height 1.55 in `--ink-2`, `text-wrap: pretty`, no margin.

### 4.9 Correspondence (chat)

No bubbles. Newspaper style.

**Section header**: `label-l` "CORRESPONDENCE" left + `mono-m` "3 entries" right. marginBottom 16px.
**Wrapper**: `border-top: 1px var(--hairline)`, paddingTop 18px.

**Message header row** (gap 12px, baseline-aligned, marginBottom 10px):
- 28×28 avatar tile, `--ink` bg, mono 10px initials `--surface`.
- Display 17px sender name `--ink`.
- "— Role" in Geist 12px `--ink-mute`.
- `mono-s` timestamp `--ink-mute` pushed right via `margin-left: auto`.

**Message body**: paddingLeft 40px (aligns under name, not avatar).
- Prose: Newsreader 17px / 1.55 / `--ink`, `text-wrap: pretty`.
- Inline mono fragments (e.g. `~$0.25 USDC`) render 14px JetBrains Mono inline. (One step smaller than surrounding prose.)
- Inline link: `color: var(--accent)`, `border-bottom: 1px solid var(--accent)`, no underline. Hover: border thickens to 1.5px or bg tints `--accent-soft`.

**Action rows** (when the agent offers choices) — used for the "Pick a direction" pattern:
- Container marginTop 18px. Header: `label-m` "PICK A DIRECTION —" in `--ink-mute`. marginBottom 10px.
- Each option = a `<button>`:
  - Border-top `1px var(--hairline-faint)`. Padding `14px 4px`.
  - Grid `22px 1fr auto` · gap 12px.
  - Col 1: `mono-m` letter A / B / C in `--ink-mute`.
  - Col 2: display 17px name `--ink` + em-dash + Geist 13px description `--ink-2`.
  - Col 3: `→` arrow 14px in `--ink-mute`.
- Closing rule: bottom `1px var(--hairline-faint)` after the last option.

### 4.10 Composer

Above the bottom of the center column. Top: `1px var(--hairline)`. Padding `16px 56px 20px`.

The composer line itself:
- Flex row, gap 12px, padding `0 4px`, paddingBottom 10px.
- **`border-bottom: 1px solid var(--ink)`** — this is the "press rule," visually load-bearing.
- Children, in order:
  1. `label-m` "REPLY —" in `--ink-mute`.
  2. Italic display 17px placeholder in `--ink-mute`, `flex: 1`.
  3. `mono-s` "⌘ ↵" hint in `--ink-mute`.
  4. 32×32 square send button: bg `--ink`, color `--surface`, white arrow SVG `→`, no border.

### 4.11 Right rail "In Residence"

- Header row: `label-m` "IN RESIDENCE" + `mono-s` "2/2".
- Each agent block (paddingBottom 16, bottom `1px var(--hairline-faint)`):
  - Row 1 (gap 10): 32×32 avatar tile (`--ink` bg / mono 11px initials).
    - Right side stack: `meta-m` (display 16) name `--ink` + `label-xs` role `--ink-mute`.
  - Row 2 (paddingLeft 42, gap 6): 5px signal dot (`--signal` if "online", else `--ink-mute`) + `mono-s` state text in `--ink-2`.
- Bottom block "SESSION" (pushed to bottom via `margin-top: auto`):
  - `label-m` "SESSION".
  - 2-col grid (1fr auto, rowGap 6px): `label-m` key in `--ink-2`, `mono-m` value in `--ink`.
  - Rows: **Spend** `$0.25` · **Tokens** `14,201` · **Started** `14:02 CET`.

### 4.12 Phase timeline (bottom bar)

- Container: 52px tall · `14px 32px` padding · `background: var(--surface-2)` · `border-top: 1px var(--hairline)`.
- Five equal columns (CSS Grid `repeat(5, 1fr)`). Each separated by `1px var(--hairline-faint)` on its right edge (except the last).
- Per column (flex row, gap 10px):
  - **20×20 phase dot**:
    - `done`: filled `--accent`, white checkmark SVG (path stroke 1.5).
    - `active`: outline 1px `--accent` + inner 6px `--accent` dot, bg `--surface`.
    - `pending`: outline 1px `--hairline`, transparent fill.
  - Stack: display 15px phase name (italic if `active`, regular otherwise; `--ink` if active/done, `--ink-2` if pending). Below: `mono-s` sub-label in `--ink-mute`.
- Phases & subs: `Discovery / Project brief`, `Design / Direction`, `Development / GitHub repo`, `Review / Sign-off`, `Go Live / Live site`.

---

## 5. Iconography

Inline SVGs only. Do not add an icon library.

| Mark         | Spec                                                                                 |
| ------------ | ------------------------------------------------------------------------------------ |
| **RegMark**  | 18×18 viewBox. Circle r=5.5 + full-width crosshair. Stroke `--ink`, width 1.1.       |
| **Asterism** | 14×14 viewBox. Three filled circles r=1 at (7,3.5), (3.5,10), (10.5,10). Fill = call-site color (typically `--accent`). |
| **Eye**      | 14×14 viewBox. Outer circle r=3 stroke 1.2, inner dot r=1 fill.                      |
| **Arrow**    | The Unicode `→` glyph (U+2192). **Not** an SVG. Carries the visual weight.           |
| **Check**    | 9×9 viewBox. Path `M1 4.5L3.5 7L8 1.5`, stroke 1.5, no fill. Color = `--surface`.    |
| **Send**     | 14×14 viewBox. Path `M2 7h10M8 3l4 4-4 4`, stroke 1.4, `strokeLinecap="square"`.     |
| **Plus**     | The Unicode `+` glyph. Not an SVG.                                                   |

**Do not** introduce additional icons. New affordances should use a typographic mark first (roman numeral, asterisk, pilcrow) before an icon.

---

## 6. Motion

The system is mostly static.

| Trigger                | Motion                                                                       |
| ---------------------- | ---------------------------------------------------------------------------- |
| Hover row / card       | `background-color 120ms ease`                                                |
| Hover primary button   | Background opacity 1 → 0.92, 120ms. No transform.                            |
| `:focus-visible`       | 2px `--accent` outline, 2px offset. No transition.                           |
| Live dot               | Optional 2s opacity pulse: `0.7 → 1 → 0.7`. Subtle. Disabled under `prefers-reduced-motion`. |
| Page transitions       | Fade only, 120ms. No slide. No staircase. No skeleton shimmer.               |

---

## 7. Responsive

Designed at **1440px wide**. Behavior at narrower viewports:

| Breakpoint  | Landing                                                                | Workspace                                                              |
| ----------- | ---------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `≥ 1280px`  | Full canonical layout.                                                 | Full canonical layout (240 / 1fr / 280).                               |
| `1024–1279` | Hero stays 2-col but reduce hero font to `display-m` (96 → 56? — keep at 180px). Page gutter 64px. | Right rail (`In Residence`) collapses into a top-right popover button. |
| `768–1023`  | Hero collapses to single column; commissions stack 1-up.                | Left rail collapses to a hamburger drawer. Right rail icon-only.       |
| `< 768`     | Single column throughout. Page gutter 24px. Hero headline 120px.        | Workspace is read-only on mobile — composer becomes a sticky CTA "Open on desktop". |

**Print stylesheet**: drop right rail. Body font 11pt. Render correspondence as a real document. Background pure white.

---

## 8. Accessibility

- Verified contrast: `--ink` on `--surface` = 14.8:1, `--ink-2` on `--surface` = 7.1:1, `--accent` on `--surface` = 5.4:1 (passes AA for normal text; we only use accent at ≥ 14px bold or as iconography).
- `--ink-mute` is **decorative** — only on metadata that doesn't load-bear (timestamps, indices). Never on actionable text.
- Every interactive element uses a real `<button>` or `<a>`, not a div. `:focus-visible` outline is mandatory.
- Skip link in `<header>`: "Skip to commissions" (landing) / "Skip to workspace" (app).
- Honor `prefers-reduced-motion: reduce` — disable the live-dot pulse.
- Form fields (composer): visible label or `aria-label`; never relying on placeholder.

---

## 9. Build order (for Claude Code)

Implement in this order. Each step must visually match its corresponding artboard region before moving on.

1. **Tokens.** `tokens.css` with `:root` containing every variable in §2.
2. **Type primitives.** Build five React/JSX components mapped to the scale:
   - `<Display size="xl|s|xs">{children}</Display>` (renders Newsreader).
   - `<Body size="l|m|s|xs">` (Newsreader for `l`, Geist for the rest).
   - `<Label size="l|m|xs">` (small-caps Geist).
   - `<Mono size="l|m|s">` (JetBrains Mono).
   - `<Headline italic="word">Ship it.</Headline>` — handles the italic-word + accent-period pattern automatically.
3. **Layout primitives.**
   - `<Rule weight={1} color="hairline|hairline-faint|ink|accent">` horizontal.
   - `<VRule>` vertical equivalent.
   - `<Asterism size color>`, `<RegMark size>`, `<Eye size>` — inline SVG components.
4. **Landing page** — compose: `<Masthead>` (§4.1) → `<Hero>` (§4.2) → `<Offerings>` (§4.3) → `<InProgress>` (§4.4) → `<Colophon>`.
5. **Workspace shell** — `<TopBar>` (§4.5), `<LeftRail>` (§4.6), `<Workspace>` (4.7–4.10), `<RightRail>` (§4.11), `<PhaseBar>` (§4.12). Wire to existing state/API shape.
6. **Strip legacy.** Remove the radial-gradient nebula and any `position:fixed` particle JS from the current site. Grep for `radial-gradient` and `constellation` and delete every match.
7. **Copy pass.** Replace every string per §0 table. Search for the banned vocabulary list and replace.
8. **QA checklist.**
   - At 1440px the artboard and the production page are pixel-identical at major landmarks (hero headline, commission card meta table, phase bar).
   - Tab order: masthead → hero CTA → commission 1 → commission 2 → in-progress rows → colophon.
   - In workspace: top bar → left rail (3 groups) → message list → composer → right rail.
   - No `border-radius` survives outside the dots.
   - No `box-shadow` anywhere in the compiled CSS.
   - No `radial-gradient` anywhere in the compiled CSS.
   - Lighthouse: contrast 100, no missing labels.

---

## 10. Sign-off

When this is built:
- Diff the rendered production page against `/index.html` artboards at 1440×1120 (landing) and 1440×900 (workspace).
- Acceptable visual delta is **antialiasing only** — no positional, sizing, or color differences > 1px.
- If a measurement isn't in this spec, eyedropper the artboard and **add it to §4 in the same PR**. Spec and implementation move together.

— End of spec —
