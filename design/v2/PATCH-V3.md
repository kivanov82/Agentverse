# PATCH v3 — App-fit pass

> Apply this on top of `SPEC.md` v1 + `PATCH-V2.md`.
> **Goal of this pass:** make the app feel like an app, not a newspaper. Both screens must fit a 1440×900 viewport exactly. Scroll lives inside the conversation region only. Decorative editorial chrome that doesn't earn its place is removed.
> **Reference artboards:** `index.html` → "I. Foundry — v3" section. Both artboards are 1440×900.

---

## §A. The big shift

The v1/v2 spec was a newspaper. v3 is an app that uses newspaper typography. Same fonts, same accent, same hairlines — but no masthead chrome, no eyebrow labels on every section, no colophon, no "VOL III · ISSUE 14" decoration. **Type carries the brand; chrome doesn't need to.**

This patch *removes* code. Resist the temptation to add anything new.

---

## §B. Things to delete (do this first)

Search the codebase for every string in the left column and delete the element containing it. None of these are functional — they're all decoration the v1 spec asked for, and they should never have shipped.

| Delete this string                                       | Where it appears        | Why                              |
| -------------------------------------------------------- | ----------------------- | -------------------------------- |
| `MAY · XX · MMXXVI` (roman date)                         | Landing masthead        | Cosmetic. Real date is in the OS.|
| `VOL III · ISSUE 14`                                     | Landing masthead        | Pretends to be a periodical.     |
| `THE COMMISSION · 01` eyebrow                            | Above the hero          | Pretends section is numbered.    |
| `─── STANDFIRST` label + rule                            | Above standfirst        | Newspaper jargon. The paragraph is the standfirst.|
| `02 · OFFERINGS` mono label                              | Above commission cards  | Redundant — there are visibly two cards.|
| `01 · OPEN` mono label                                   | Above in-progress       | Same.                            |
| `01 / 02` , `02 / 02` index inside commission cards      | Card top-right          | Same.                            |
| `IN PROGRESS · YOUR FOLIOS` small caps                   | Landing                 | Replace with plain "Open folios" or remove section on logged-out marketing page.|
| Whole `Colophon` footer with `SET IN NEWSREADER & GEIST · PRINTED ON THE WEB` and `SHIPWITHAI.NL` mono | Landing footer | Vanity copy. Move "shipwithai.nl" to the OS browser bar — it's already there. |
| `FOLIO · SOLIDITY AUDIT` small caps in workspace top bar | Top bar middle-left     | Replace with proper breadcrumb (see §D.1). |
| `Folio I · The Method` eyebrow                           | Workspace center        | Decorative. Drop the eyebrow entirely. |
| `How we audit.` H2 + the three-methodology row           | Workspace center        | This is reference info, not workspace content. **Drop both from the workspace.** (Put them on a `/project` tab if they need to live somewhere.) |
| `IN RESIDENCE` + `2/2` mono label                        | Right rail header       | Replace with "Agents on this folio" — plain words. |
| `SESSION` small caps + `Spend / Tokens / Started` block  | Right rail bottom       | Keep, but call it "This session". Plain title. |
| `Project brief / Auditor passes / Findings / Sign-off / PDF & repo` mono sub-labels | Phase bar | Sub-labels make the phase bar twice as tall for no information. Phase name alone is enough.|
| `Standfirst` mid-page label                              | Anywhere                | Once again, jargon.              |

Net result: the page should feel ~30% lighter without losing any information.

---

## §C. Landing — fit 100% viewport

The whole landing must render in a 1440×900 window with **no scroll**. Treat it as a single fixed canvas, not a long-form article.

### C.1 Layout budget

The 900px height breaks down like this:

| Region                    | Height          |
| ------------------------- | --------------- |
| Top bar                   | 56              |
| Hero (split row)          | 384             |
| Commissions header        | 60              |
| Commissions card row      | flex (fills)    |
| Bottom padding            | 32              |
| **Total**                 | **900**         |

If anything overflows, shrink the hero — not the commission cards.

### C.2 Top bar (replaces masthead)

```
┌───────────────────────────────────────────────────────────────┐
│ ⊕ ShipWith.AI              How it works   Pricing   [Sign in →] │
└───────────────────────────────────────────────────────────────┘
```

- 56px tall, padding `0 40px`, bottom `1px solid var(--hairline)`.
- Left: regmark + wordmark (same as before).
- Right: two text nav links (Geist 14, `--ink-2`) + filled `Sign in →` button (Geist 13 / 500, bg `--ink`, color `--surface`, padding `9px 18px`).
- **Delete** the roman date + volume.

### C.3 Hero (split row, no scroll)

Two columns, `1.1fr / 1fr`, gap 80, padding `64px 96px 56px`, vertically centered.

**Left column** — headline only. No eyebrow.
- `<h1>` "Ship _it_." at **168px** (down from 220). Single line. Period in `--accent`.
- Nothing else. No standfirst, no "Today's commission · 01" label.

**Right column** — standfirst + CTAs, vertically centered.
- Standfirst paragraph in `display-l-ish` (26px / Newsreader 400 / 1.32). Includes the italicized phrase "auditors, analysts, engineers".
- 28px gap.
- CTA row, 12px gap:
  - **Primary** `Brief a project →` — filled `--ink`, padding `15px 24px`, Geist 15 / 500.
  - **Secondary** `See commissions ↓` — outlined `1px solid var(--ink)`, transparent bg, same padding.

### C.4 Commissions row (fills remaining space)

Title row:
- `<h2>` "Choose a commission" — Newsreader 22 / 400 / `letter-spacing -0.01em`. Not small caps.
- Right side: plain UI text "Two ready · more next month" in 13px `--ink-2`.
- Bottom-aligned to a `1px solid var(--ink)` rule.

Cards: 2-column grid, gap 24, each card uses the remaining flex height.

**Card structure**:
- `<a>` wrapper. Card 1 is the primary; bg `--hover`, border `1px solid var(--ink)`. Card 2 is default; transparent bg, border `1px solid var(--hairline)`.
- Padding `22px 26px 24px`. `display: flex; flex-direction: column`.
- Header: italic roman 20px `--accent` + display 34px title `--ink`, baseline-aligned, gap 10.
- Dek: Geist 14 / 1.5 / `--ink-2`, marginBottom 18.
- **Metadata is now horizontal**, 3 columns:
  - `Lead | Turnaround | From`
  - Each cell: small-caps label `--ink-mute` 10px on top, value in Geist 13 `--ink` below. Vertical hairlines between cells.
  - Drop the "Scope" metadata field — the card title + description already convey scope. (3 fields, not 4, makes the row fit horizontally.)
- Footer button (pushed to bottom via `margin-top: auto`): the same "Commission this" full-width button from PATCH-V2 §A.3. Primary variant (filled accent) on card 1, default (outlined ink) on card 2.

### C.5 What's gone from landing

The In-Progress / Your Folios list is **not on the logged-out landing**. It belongs in the authenticated workspace. If you need a "continue your folio" entry point on the marketing page, put a single line under the hero CTAs:

> Have an open folio? [Resume →]

Not a full table. Not a section. One line.

---

## §D. Workspace — fit 100% viewport with chat-only scroll

Whole workspace fits 1440×900. **The center column scrolls; nothing else.** Sidebars get their own scroll if their content overflows.

### D.1 Top bar (now a tab bar)

Replace the v2 top bar entirely:

```
┌────────────────────────────────────────────────────────────────────┐
│ ⊕ ShipWith.AI   Folios / Solidity Audit    [Observatory] Project   │
│                                              ─────────              │
│                                                    Files  Ledger  ● Live │
└────────────────────────────────────────────────────────────────────┘
```

- 56px tall, padding `0 24px`, bottom `1px solid var(--hairline)`.
- Flex row, gap 24.
- **Left cluster** (`min-width: 220px`): regmark + wordmark.
- **Breadcrumb**: Geist 13 `--ink-mute` "Folios" + `/` + Newsreader 16 `--ink` "Solidity Audit". This replaces the "FOLIO · SOLIDITY AUDIT" small-caps.
- **Tab nav** (pushed right with `margin-left: auto`): `Observatory`, `Project`, `Files`, `Ledger`. Each tab is a real `<button>`:
  - Padding `0 14px`. Full bar height.
  - Geist 13. Active: weight 600 + `--ink`. Inactive: weight 500 + `--ink-2`.
  - Active tab gets a `2px var(--accent)` underline `bottom: -1px; left: 8px; right: 8px;` (overlays the top-bar bottom border).
  - Hover: bg `--hover`.
- **Status pip**: 7px `--signal` dot + "LIVE" small-caps. Separated from tabs by a `1px var(--hairline)` vertical rule (height 24) + 16px padding.

This is what makes the tabs look clickable — they have hit areas and an active underline indicator.

### D.2 Drop the methodology row

Delete the "How we audit." H2 + 3-column methodology row from the workspace center. That content moves to the `Project` tab. The Observatory is for the live conversation, nothing else.

### D.3 Center column — three fixed regions

```
┌──────────────────────────────────────────────────────┐
│ ● Agent waiting on your reply              [Reply ↓] │  ← banner (fixed, 56px)
├──────────────────────────────────────────────────────┤
│                                                      │
│   …conversation entries, scrollable…                 │  ← chat (flex 1, scroll-y)
│                                                      │
├──────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┬────┬──────┐ │
│ │ Type a direction…                    │ ¶  │ SEND │ │  ← composer (fixed)
│ └──────────────────────────────────────┴────┴──────┘ │
│ ⌘↵ to send · ⌘K for commands              Auto-saved │
└──────────────────────────────────────────────────────┘
```

**Banner** — same as PATCH-V2 §B.1 but simpler:
- One short sentence in display 15px ("An agent is waiting on your reply." / "Audit ready for sign-off." / etc.).
- Right: small `Reply ↓` button (filled accent, padding `7px 14px`).
- Drop the small-caps eyebrow above the sentence — the banner's bg + accent dot already do that work.

**Chat region** — `overflow-y: auto`, `min-height: 0`. The `min-height: 0` is critical or the flex item won't actually shrink; without it the whole page scrolls. (This was the bug in v2.)

Each conversation entry:
- 22px gap between entries (`marginBottom: 22`).
- Header row: 24px avatar tile + display 15 name + separator dot + Geist 11 role + mono 10 timestamp (right-aligned).
- Body indented `padding-left: 34` to align under name.
- Body in Newsreader 16 / 1.55 / `--ink`, `text-wrap: pretty`.

**Avatar variants**:
- **Agent avatar**: bg `--ink`, color `--surface`, mono 9px initials.
- **User avatar ("YOU")**: bg transparent, color `--ink`, border `1px solid var(--ink)`, mono 9px "YOU". This visually separates the user's own messages from agent messages without resorting to bubbles.

**Composer** — full-width input row with two icon buttons:
- Border `1px solid var(--ink)`, bg `--card`.
- Real `<input>` field. Italic placeholder. Switches to non-italic + `--ink` on focus.
- Middle "¶" attach button (transparent, 14px padding, separator hairline left).
- Right `SEND →` button (filled `--ink`).
- Underneath, a 6px-margin-top utility row: left "⌘↵ to send · ⌘K for commands" in mono 10 `--ink-mute`, right "Auto-saved" same style. Tells the user how to use it.

### D.4 Left rail

- Padding `20px 16px`, gap 22.
- **Account block**: plain "ACCOUNT" eyebrow, then balance `$1.35` (display 28) + "USDC" mono. Below: a **full-width filled** `+ Top up` button. Drop the wallet-address ghost button — it belongs in a settings modal, not the main rail.
- **Folios list**: 3 sample rows, urgency dot on the active+pending one. Folio names are **Geist 13** in the workspace (we want them to read as nav items, not as editorial titles). Active item: bg `--hover` + 2px accent left border.
- **Bottom**: a single `Settings →` link, separated by a top hairline. Replaces the v2 "Workshop · Agents / Project / Ledger" sub-nav — that's redundant with the top tab bar.

### D.5 Right rail

- "Agents on this folio" eyebrow (plain small caps).
- For each agent (PM, SA): 30px avatar + display 15 name + Geist 11 role. Below: signal dot + state text + small outlined "Ask" button (same as v2 §B.7).
- "This session" block: 3 rows of label/value pairs in plain UI text. Drop the small-caps + mono pairing — too noisy.
- Pushed to bottom (margin-top: auto): a full-width outlined `View full report` button. The user wants somewhere obvious to click when the conversation is too long to read.

### D.6 Phase bar (rebuilt)

```
[●]Discovery ━━━━━ [◯]Design ─────── [◯]Build ───────── [◯]Review ───────── [◯]Deliver
```

- Single 12-padding bar, no per-column borders, no sub-labels.
- Each phase: 18px circular dot + 13px label. Dot states:
  - **done**: filled `--accent` + white checkmark.
  - **active**: outlined `--accent` + 6px inner dot. Label is `--accent` + weight 600.
  - **pending**: outlined `--hairline`. Label is `--inkMute`.
- Between phases: a flex-fill connecting rule. Color `--accent` if the *preceding* phase is done; else `--hairline` at 0.5 opacity.

This makes the progress feel like progress, not five stamps in a row.

---

## §E. Updates to SPEC.md (apply in same PR)

The spec should now describe a 1440×900 app, not a long-scroll editorial page. Apply these edits:

1. **§0.1 Copy table** — delete every row referring to deleted strings from §B above.
2. **§1.3 Editorial rules** — remove the rule about "roman numerals are always italic + accent color, followed by a period and a non-breaking space". They appear *only* on commission cards now.
3. **§3 Spacing** — replace the page-gutter row with: `Landing horizontal gutter: 96px. Workspace horizontal gutter: 24px top bar / 48px chat / 16px rails.`
4. **§4.1 Masthead** — **delete entire section**. Replace with new §4.1 "Top bar (landing)" matching §C.2 above and new §4.1b "Top bar (workspace)" matching §D.1 above.
5. **§4.2 Hero** — replace with §C.3 above. Headline 168, single line.
6. **§4.3 Commission cards** — drop "Scope" field, metadata row is now horizontal.
7. **§4.4 In Progress** — delete from public landing. Move to workspace folios list.
8. **§4.5 Top bar** — superseded by new §4.1b.
9. **§4.6 Left rail** — replace with §D.4. Drop the "Workshop / Agents / Project / Ledger" sub-nav (it's the top tab bar now).
10. **§4.7 Folio header (workspace)** — **delete entire section**. There is no folio header in the workspace center anymore.
11. **§4.8 Methodology row** — **delete entire section**. Moves to the `Project` tab (separate spec).
12. **§4.9 Correspondence** — update avatar variants: "YOU" gets an outlined transparent variant (§D.3).
13. **§4.10 Composer** — replace with §D.3 composer spec. Add the mono 10 utility row below.
14. **§4.11 In Residence** — rename to "Agents on this folio". Drop the count "2/2".
15. **§4.12 Phase bar** — replace with §D.6 above. Drop sub-labels. Add the connecting rule between phases.
16. **§2.1 Accent allowed places** — remove "The asterism dots in eyebrow labels" (no more asterisms). Remove the wordmark `.AI` rule? No — keep that. Add: "The tab bar's active-tab underline."

---

## §F. Acceptance criteria

When merged:

- [ ] Landing renders fully inside a 1440×900 viewport with **no vertical scroll**. Verify by setting the browser to 1440×900 and confirming `document.documentElement.scrollHeight === window.innerHeight`.
- [ ] All decorative strings from §B are gone. Grep returns zero hits for `VOL III`, `MAY · XX`, `COLOPHON`, `STANDFIRST` (as a label), `THE COMMISSION ·`, `02 · OFFERINGS`, `01 · OPEN`, `01 / 02`, `IN RESIDENCE`.
- [ ] The workspace top bar shows clickable tabs (Observatory, Project, Files, Ledger) with a visible active underline. Hovering a tab tints its background.
- [ ] The workspace center is the only scrollable region. The page itself doesn't scroll. Verify by scrolling the chat — sidebars and phase bar stay put.
- [ ] The `How we audit.` methodology row is **not** in the Observatory tab. (It may live in `Project`.)
- [ ] The composer is a real `<input>` element with focus state.
- [ ] The phase bar is a single horizontal row with no sub-labels. Connecting rules between phases.
- [ ] `+ Top up` is a full-width filled button below the balance. Wallet-address ghost button is gone from the main rail.

When all eight pass, ship it. This is the last patch for these two screens — the next ones should be new surfaces (Files tab, Ledger tab, Brief intake flow, etc.) rather than more revisions of these.
