# PATCH v2 — Usability fixes for Foundry

> **Apply on top of** `SPEC.md` v1. This patch addresses real-world usability problems found after shipping v1 to production.
> **For Claude Code.** Each change is small and surgical — implement them all, in any order, in a single PR titled `fix: Foundry v1.1 — usability patch`.
> **Reference artboard:** open `index.html` → "I. Foundry — v2" section. The two artboards there (`Landing · v2` at 1440×1080, `Workspace · v2` at 1440×900) are the new ground truth.

---

## The problem v1 had

The v1 spec optimized for editorial beauty. In production this caused four concrete UX failures, all confirmed against the live shipwithai.nl:

1. **Hero hogs the viewport.** At 1080p, "Ship it." filled the screen — users had to scroll just to see the commission cards.
2. **Buttons read as decoration.** "Commission →" rendered as thin red text + arrow. Looked like a label, not a control.
3. **Composer was invisible.** The single hairline-bottom-rule input read as static text, not a writable field.
4. **No flow.** Nothing told the user what to do next, especially in the workspace.

The fixes below preserve the editorial system 100% — same fonts, same accent, same hairline language, same one accent color in approved places only — and add the missing affordances.

---

## §A. Landing page

### A.1 Hero — shrink it

| Property                 | v1     | v2     |
| ------------------------ | ------ | ------ |
| Hero `padding-top`       | 88px   | **48px** |
| Headline `font-size`     | 220px  | **144px** |
| Headline layout          | "Ship" + `<br>` + "it." stacked | **"Ship _it_." inline on one line** |
| Right column structure   | Standfirst + CTA | Standfirst paragraph **moved under headline (left column)**, right column becomes an action panel |

The single biggest fix. After this, the offerings render fully visible at 1080p.

### A.2 Right column → action panel

The right column is now an explicit "How a commission works" panel + primary CTA, instead of repeating the standfirst.

Structure (replaces the entire right column):

```
─── HOW A COMMISSION WORKS
┌──────────────────────────────────────────┐
│ I.   Brief                                │
│       Tell the studio what you need, in   │
│       plain language.                     │
│ ─────                                     │
│ II.  Commission                           │
│       Top up your account. Agents go      │
│       to work.                            │
│ ─────                                     │
│ III. Receive                              │
│       Audit, rewrite, or deploy —         │
│       delivered to your inbox.            │
└──────────────────────────────────────────┘

[Brief a new project →]  [Browse commissions ↓]
```

Specs:
- Section label same treatment as v1 small-caps `label-l` "How a commission works".
- Numbered list bordered with `1px solid var(--hairline)`. Each row: grid `40px 1fr`, padding `12px 16px`, internal divider `--hairline-faint`.
- Step number: italic display 16px in `--accent`.
- Step name: display 17px in `--ink`.
- Step description: Geist 13px in `--ink-2`.
- CTA row gap 12px. **Two buttons of equal weight** — primary filled, secondary outlined:

**Primary `Brief a new project →`**: bg `--ink`, color `--surface`, border `1px solid var(--ink)`, padding `16px 24px`, Geist 15px / 500.

**Secondary `Browse commissions ↓`**: bg transparent, color `--ink`, border `1px solid var(--ink)`, padding `16px 24px`, Geist 15px / 500. The down-arrow is intentional — it tells the user where to look next.

### A.3 Commission cards — make them buttons

The "Commission →" footer was the only click target. v2 turns the whole card into a clickable surface AND replaces the thin footer with a real button.

| Property                          | v1                              | v2                                            |
| --------------------------------- | ------------------------------- | --------------------------------------------- |
| Card wrapping element             | `<div>` w/ `cursor: pointer`    | `<a href>` block                              |
| Hovered-card top edge             | (nothing)                       | **2px solid `--accent` strip across the top** (visible only on hover/focus, OR pre-applied to the first card to signal interactivity) |
| Hovered card background           | (nothing)                       | `background: var(--hover)`                    |
| Footer CTA                        | thin rule + small-caps + arrow  | **Real bordered button — full width of the card body** |
| First card (primary recommendation) | identical to second              | bg `var(--hover)` + accent top strip pre-applied + filled-accent button (see below) |

**Card footer button:**

```html
<div class="commission-cta">
  <span>COMMISSION THIS</span>
  <span aria-hidden>→</span>
</div>
```

- Padding `12px 16px`. Border `1px solid` (color depends on variant).
- Geist 13px / 600 / `letter-spacing: 0.18em` / uppercase.
- Two variants:
  - **Primary** (first card or hovered card): `background: var(--accent)`, `color: var(--surface)`, `border-color: var(--accent)`.
  - **Default**: `background: transparent`, `color: var(--ink)`, `border-color: var(--ink)`.
- Arrow on the right, label on the left, justified between.

### A.4 In-Progress list — give every row a Resume button

| v1                                                          | v2                                                          |
| ----------------------------------------------------------- | ----------------------------------------------------------- |
| 5-col grid · status uses signal-green dot only              | 6-col grid · status dot turns `--accent` for items awaiting user reply · adds explicit `Resume →` button on the right |
| Status copy: `design phase`                                 | Status copy: `awaiting your reply` (when actionable) — accent dot + accent small-caps text |

New row grid: `24px 1fr 1fr 140px 1fr auto` (gap 16px).

The right-edge button:
```html
<a class="resume-btn">RESUME <span>→</span></a>
```
Padding `8px 14px`, border `1px solid var(--ink)`, Geist 12px / 600 / `letter-spacing: 0.14em` / uppercase, color `--ink`, bg transparent.

---

## §B. Workspace (Observatory)

### B.1 NEW — "Next" action banner at top of center column

The single most important addition. A thin accent-bordered strip pinned at the top of the center column (above the folio header) telling the user exactly what's expected of them right now.

```
┌────────────────────────────────────────────────────────────────┐
│ ●  NEXT — AWAITING YOUR REPLY              [ JUMP TO REPLY ↓ ] │
│    Pick a direction to begin the audit.                         │
└────────────────────────────────────────────────────────────────┘
```

Specs:
- Sits between the top bar and the scrollable workspace content.
- Padding `12px 56px`. Background `var(--accent-soft)`. Border-bottom `1px solid var(--accent)`.
- Flex row, gap 16px.
- 8px circular `--accent` dot.
- Stack: small-caps eyebrow `NEXT — AWAITING YOUR REPLY` color `--accent` weight 600 + display 15px description in `--ink`.
- Right: filled-accent button `JUMP TO REPLY ↓` (scrolls to the composer or the last unanswered message). Same button spec as A.3 primary footer button.
- **Hide entirely** when there is no pending user action — never show an empty/inactive version.

### B.2 Folio header — condense

| Property                 | v1     | v2     |
| ------------------------ | ------ | ------ |
| H2 `font-size`           | 34px   | **26px** |
| `margin-bottom` of header | 24px  | **16px** |
| Lede paragraph           | shown   | **removed from workspace** (move it to a tooltip on the folio name) |

Saves ~80px of vertical space and gets the user to the correspondence faster.

### B.3 Methodology row — tighten

| Property                | v1            | v2            |
| ----------------------- | ------------- | ------------- |
| Column padding          | `20px 22px 22px` | **`14px 18px 16px`** |
| Roman numeral size      | 15px          | **14px**       |
| Methodology name size   | 19px          | **17px**       |
| Body font-size          | 13px          | **12px**       |
| Body copy length        | full sentence | **shortened to one clause** |

Suggested body copy:
- Feynman: "Business-logic sweep. Any step we can't justify becomes a finding."
- Nemesis: "Adversarial loop. We attack our own findings until nothing new surfaces."
- State Inconsistency: "Coupled-state desync hunt. Any unupdated partner is a bug waiting to ship."

### B.4 Left rail — Account block becomes interactive

**Replace** the `+ TOP UP` / wallet-address line of small mono text with **two real buttons**:

```html
<div class="account-actions">
  <button class="btn-primary-small">+ TOP UP</button>
  <button class="btn-ghost-small">0x4f…2a91</button>
</div>
```

- Container: `display: flex; gap: 8px; margin-top: 12px;`.
- Both buttons: Geist 11px / 600 / `letter-spacing: 0.16em` / uppercase, padding `8px 10px`.
- Primary (`+ TOP UP`): bg `--ink`, color `--surface`, `flex: 1` (takes available width). This is the most-used action; treat it as primary.
- Ghost (wallet): bg transparent, color `--ink-2`, border `1px solid var(--hairline)`, mono 10px. Click → copy address to clipboard.

### B.5 Left rail — Folios list gets urgency dots

Add a single 6px `--accent` circular dot between the folio name and the days-ago time **when that folio is awaiting user action**. Grid becomes `1fr auto auto`, gap 8px:

```
Solidity Audit          ●   28d
Landing Refresh              4d
```

This makes the rail glanceable — user sees at a glance which projects need them.

### B.6 Composer — real bordered input field

The single biggest workspace bug. The v1 composer rendered as a hairline-bottom-bordered row that read as static text. Rebuild as a bordered field with a SEND button.

Structure:

```
─── YOUR REPLY                    ¶ Attach   ⌘ ↵ to send

┌───────────────────────────────────────────────────────┬─────────┐
│  Type a direction, ask a question, or attach a file…  │ SEND →  │
└───────────────────────────────────────────────────────┴─────────┘
```

Specs:
- Outer wrapper padding `14px 56px 20px`, top `1px solid var(--hairline)`.
- Label row (justify-between, marginBottom 8px): small-caps `YOUR REPLY` in `--ink` + right cluster of `¶ Attach` (Geist 11px `--ink-mute`) and `⌘ ↵ to send` (mono 10px `--ink-mute`).
- Input wrapper: `display: flex; border: 1px solid var(--ink); background: var(--card);`.
- Input region: padding `14px 16px`, flex: 1, Newsreader 17px italic `--ink-mute` for placeholder, switches to `--ink` non-italic on focus.
- Send button: `border: none; border-left: 1px solid var(--ink); background: var(--ink); color: var(--surface);`. Padding `0 20px`. Geist 12px / 600 / 0.16em letter-spacing / uppercase. Content: "SEND →".

### B.7 Right rail — Agent rows get an ASK button

Each `In Residence` agent gets a small outlined `ASK` button on the right of the state row, so the user always knows they can address that agent directly.

Structure changes only the state row (the line below the name):

```
[●] standing by                       [ ASK ]
```

- State row becomes `display: flex; justify-content: space-between; align-items: center;`.
- ASK button: Geist 10px / 600 / 0.16em / uppercase, padding `4px 10px`, border `1px solid var(--hairline)`, color `--ink`, bg transparent. Hover → border `--ink`, bg `--hover`.

### B.8 Phase bar — fix the active-state bug

**This is an implementation bug in v1, not a design change.** §4.12 of `SPEC.md` already requires:
- `done` phases: filled `--accent` + white checkmark.
- `active` phase: outlined `--accent` + inner accent dot + italic display name.

In production right now, all five phases render as `pending`. **Confirm the state mapping in the data layer is being passed through to the component**, and that the `active` state's italic + accent styling is reaching the DOM. Visual reference is unchanged from v1 §4.12.

For the Solidity Audit folio in the sample: Discovery=done, Design=active, the rest=pending.

---

## §C. Updates to SPEC.md (apply in same PR)

Append these clarifications so future passes don't regress:

1. **§3 Spacing scale**: add note "Hero `padding-top` is **48px**, not 88px. The 88px value in v1 caused above-fold content loss."
2. **§4.2 Hero**: replace "Two equal columns…" block with the new v2 hero structure (single-line headline 144px, standfirst left, action panel right).
3. **§4.2 CTAs**: replace the single dark button with two buttons of equal weight.
4. **NEW §4.3a "How a commission works" panel**: spec the right-column 3-step list.
5. **§4.3 Commission cards**: card wrapper is `<a>`, not `<div>`. Footer CTA is a real bordered button. First card has primary variant.
6. **§4.4 In-Progress**: 6-col grid, accent dot for urgent status, Resume button on right.
7. **NEW §4.5a Next-Action banner**: spec the workspace top-of-column banner from §B.1.
8. **§4.6 Left rail Account**: account actions are two real buttons (filled + ghost), not mono text.
9. **§4.6 Left rail Folios**: 3-col grid with urgency dot.
10. **§4.7 Folio header**: H2 26px (was 34), lede removed.
11. **§4.8 Methodology row**: tighter paddings and one-clause body copy.
12. **§4.10 Composer**: REPLACE entire section with §B.6 above. The hairline-rule version is gone.
13. **§4.11 In Residence**: each row gets an ASK button on the state row.
14. **§4.12 Phase bar**: no spec change. Add a QA item: "verify active state actually renders accent + italic in production."
15. **§2.1 Accent allowed places**: add three: "Urgency dot on folio name (left rail)", "Urgency dot on in-progress row", "Next-action banner border and dot".

---

## §D. Acceptance criteria

When this patch is merged:

- [ ] At 1440×1080 viewport, the landing page shows: masthead + hero + standfirst + "How a commission works" panel + CTA row + section heading + at least the top half of both commission cards — **all without scrolling**.
- [ ] Hovering a commission card shows a clear interactive state (accent top strip + hover bg).
- [ ] The first commission card has a filled `COMMISSION THIS →` button in `--accent` — visible from across the room.
- [ ] In the workspace, a `NEXT — AWAITING YOUR REPLY` banner renders at the top of the center column when (and only when) there is a pending user action.
- [ ] The composer is a bordered box with a clearly-labeled `SEND →` button, not a text-with-underline.
- [ ] `+ Top up` in the left rail is a filled button, not a mono text label.
- [ ] Each agent in the right rail has an `ASK` button on its state row.
- [ ] The phase bar shows `Design` as visibly active (italic + accent), `Discovery` as visibly done (filled + check).

When all eight pass, ship it.
