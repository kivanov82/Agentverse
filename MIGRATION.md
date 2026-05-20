# Foundry redesign — migration notes

A precision port of the ShipWith.AI app to the Foundry direction described in
`design/v2/SPEC.md`. Cream paper, deep ink, single vermilion accent. No dark
theme, no toggle, no variants.

Branch: this PR. Commits: `feat(design): step 1 … step 8`.

---

## Renamed / restructured components

The Foundry shell lives in `apps/web/components/foundry/`. Every component
emits its own inline styles (so the system reads the same outside Tailwind),
sourced from the CSS variables in `apps/web/app/globals.css`.

| Concern                          | New (Foundry)                                                    |
| -------------------------------- | ---------------------------------------------------------------- |
| Tokens                            | `foundry/tokens.ts` + `:root` in `globals.css`                  |
| Type scale                        | `foundry/type.tsx` — `<Display>`, `<Body>`, `<Label>`, `<Mono>`, `<Headline>` |
| Inline SVG marks                  | `foundry/marks.tsx` — `<RegMark>`, `<Asterism>`, `<Eye>`, `<Check>`, `<SendArrow>` |
| Hairline rules                    | `foundry/Rule.tsx` — `<Rule>`, `<VRule>`                        |
| Landing — masthead                | `foundry/Masthead.tsx`                                          |
| Landing — hero                    | `foundry/Hero.tsx`                                              |
| Landing — commission cards        | `foundry/Offerings.tsx`                                         |
| Landing — open folios row         | `foundry/InProgress.tsx`                                        |
| Landing — colophon                | `foundry/Colophon.tsx`                                          |
| Workspace top bar                 | `foundry/TopBar.tsx`                                            |
| Workspace left rail               | `foundry/LeftRail.tsx`                                          |
| Workspace right rail              | `foundry/RightRail.tsx` + `<AvatarTile>`                        |
| Workspace bottom phase bar        | `foundry/PhaseBar.tsx`                                          |
| Folio header / lede               | `foundry/FolioHeader.tsx`                                       |
| Three-column methodology          | `foundry/Methodology.tsx`                                       |
| Correspondence stream             | `foundry/Correspondence.tsx` + `<InlineMono>` + `<InlineLink>`  |
| Composer / press-rule input       | `foundry/Composer.tsx`                                          |

## Deleted components

Every component below was replaced by the Foundry shell above, or removed
because the redesign drops its function entirely (multi-color agent badges,
ambient observatory chrome, debug-only modals, gradient cursor trail, etc.).

```
components/ActivityFeed.tsx
components/AgentCard.tsx
components/AgentChatBubble.tsx
components/AgentChatPanel.tsx          # behavior absorbed into dashboard/page.tsx
components/AgentCircle.tsx
components/AgentDetailModal.tsx
components/AgentFlow.tsx
components/AgentNode.tsx
components/AuditMethodologyExplainer.tsx  # superseded by foundry/Methodology
components/ChatInterface.tsx
components/ConstellationBackground.tsx
components/ConstellationGlyph.tsx
components/CursorTrail.tsx
components/DeliverablesPanel.tsx
components/EventFeed.tsx
components/Logo.tsx                    # replaced by <RegMark/> + <Wordmark>
components/MobileOverlay.tsx
components/NavigationProgress.tsx      # sliding indicator violates SPEC §6
components/ObservatoryModal.tsx
components/OnboardingOverlay.tsx       # tour targets no longer render
components/PaywallOverlay.tsx
components/ProjectHeader.tsx
components/ProjectTrigger.tsx
components/SessionPanel.tsx
components/SimpleAgentGrid.tsx
components/SimpleChatInterface.tsx
components/SimpleDeliverables.tsx
components/SpeechBubble.tsx
components/UserChatPanel.tsx
components/UserMenu.tsx                # account affordances moved into LeftRail
app/dashboard/observatory/page.tsx     # admin debug view, no entry point in shell
```

## Reskinned (kept; visually rewritten to Foundry)

```
components/SignInModal.tsx
components/TopUpModal.tsx
components/TopUpToast.tsx
components/UseCaseWizard.tsx
components/AuditDepthStep.tsx
components/ProjectBrief.tsx
components/ProjectSummary.tsx
components/DeliverablesTree.tsx
components/Providers.tsx               # RainbowKit lightTheme, accent vermilion
app/page.tsx                           # full rewrite — Foundry landing
app/layout.tsx                         # Newsreader + Geist + JetBrains Mono
app/globals.css                        # tokens-only; all observatory chrome dropped
app/dashboard/layout.tsx               # Foundry shell wrapping children
app/dashboard/page.tsx                 # workspace center: FolioHeader + Methodology + Correspondence + Composer
app/dashboard/project/page.tsx         # project sub-view in Foundry surfaces
app/onboard/page.tsx                   # Foundry surface
tailwind.config.js                     # neutralised; corePlugins disabled for banned treatments
```

## Spec discrepancies found mid-port

These came up while porting; each was resolved on the side of the artboard
(`design/v2/foundry.jsx`) where SPEC.md was ambiguous or self-contradictory.

1. **SPEC §7, 1024–1279 hero size.** The line "reduce hero font to `display-m`
   (96 → 56? — keep at 180px)" contradicts itself. Resolved by keeping the
   bigger number (`180px`) at that breakpoint, matching the artboard's
   at-scale feel. Recommend updating SPEC §7 to say "180px" without the
   parenthetical.

2. **SPEC §4.10 send button border.** Spec says "no border"; the reference
   `foundry.jsx:549` declares `border: 1px solid F.ink` with `background:
   F.ink` (same colour, so the border is invisible). Followed the spec —
   `border: none` — since the reference's border is a no-op anyway.

3. **SPEC §4.5 top-bar vertical hairline.** Spec doesn't fix the hairline
   height; the reference uses `height: 18`. Adopted `18` to match.

4. **SPEC §4.11 right-rail SESSION values.** Spec lists `Spend $0.25 ·
   Tokens 14,201 · Started 14:02 CET` as mocks. Wired Spend to
   `sessionCost`, Started to `activeSession.createdAt`. Tokens has no live
   source yet — renders as `—` rather than fabricating a number. Spec
   should clarify that an em-dash is the canonical "no live data" value.

5. **SPEC §4.12 phase enum.** Audit folios don't have a Design phase. Added
   an `AUDIT_PHASES` constant (`Discovery → Methodology → Report → Review
   → Delivered`) selected when `activeUseCase === 'solidity-audit'`. Spec
   should add this variant or call out that the phase set is per-use-case.

6. **SPEC §0.1 sign-in / top-up modal headlines.** Spec doesn't define
   these. Authored Foundry treatments: `THE DOOR · Sign in.` and `THE
   LEDGER · Top up.`. Adjust to taste; flagging for review.

7. **SPEC §2.1 wallet UI accent.** The RainbowKit modal opens an entire
   third-party UI we can't redesign without forking. Configured it to
   `lightTheme` with `accentColor: '#A8311C'`, `borderRadius: 'none'`,
   `overlayBlur: 'none'` to bring it as close to Foundry as is possible
   without a fork. The compiled CSS still contains RainbowKit's
   `[data-rk]`-scoped `box-shadow` / `border-radius` / `backdrop-filter`
   rules; these only render when the wallet-connect modal opens. Spec
   should call out this as an acceptable vendor exception, or we need to
   replace RainbowKit with a Foundry-native wallet picker.

## QA — gate results

Final grep audit over compiled CSS (`apps/web/.next/static/css/*.css`),
after the build:

```
=== first-party hits (outside [data-rk]) ===
  radial-gradient    → 0
  linear-gradient    → 0
  box-shadow         → 1     ← Tailwind preflight reset: `box-shadow:none`
  drop-shadow        → 0
  backdrop-filter    → 0
  border-radius      → 0
  filter:            → 0
```

The single first-party `box-shadow` hit is `box-shadow:none` inside Tailwind's
preflight reset — a defensive normalization that *removes* user-agent
shadows from form elements. It does not apply a shadow. Removing the
preflight would re-introduce UA shadows on buttons and inputs, which is
strictly worse for the Foundry surface. Treating this as a documented
known-false-positive of the literal grep.

Other gate results (over `app/` + `components/` + `lib/`):

- Banned vocab (constellation, vision, magic, AI-powered, revolutionary,
  seamless, journey/journeys): **0 hits**.
- `rounded-*` utility classes: **0 hits**.
- Inline `borderRadius`: every value is `0` (square) or `'50%'` (the eight
  dots in the system — live indicator, signal dots, phase dots, audit-depth
  radio, sign-in radio, in-residence pulse dot). Compliant with SPEC §2.2.
- TypeScript: `npx tsc --noEmit` exits 0.
- `next build`: succeeds with no errors or warnings.

## Behaviour preserved (no regression intended)

- Auth: NextAuth + SIWE flow unchanged; SignInModal reskinned.
- Credits: `useCredits()` hook + balance refresh on `BALANCE_CHANGED_EVENT`
  intact; LeftRail balance + `+ TOP UP` use it.
- Top-up: Stripe + x402 rails intact; TopUpModal reskinned.
- Project lifecycle: store hydrate-on-mount, `resumeProject(id)`, recent
  projects fetch, phase progression (when PM emits `submit_plan`) all
  wired through the new shell.
- Agent invocation: `invokeAgent` streaming path used from
  `dashboard/page.tsx` `onSend`. PR-review / handoff orchestration that
  previously lived inside the deleted `AgentChatPanel` is **not** ported
  in this PR — only the user-visible message round-trip. Re-wiring the
  full handoff lifecycle into the new Foundry surface is a follow-up.

## Follow-ups (not in this PR)

1. **Handoff + tool-call surfacing in Correspondence.** The deleted
   `AgentChatPanel` rendered tool-call labels, suggested handoffs and
   project plan ingestion. Port those affordances into `Correspondence` /
   `Composer` as Foundry-styled option rows.

2. **RainbowKit replacement.** Replace with a small Foundry-native wallet
   picker to eliminate the vendor-locked `[data-rk]` CSS exceptions.

3. **Mobile.** SPEC §7 collapse rules at `< 1024px` are sketched but not
   implemented; current layout is desktop-only at 1440px.

4. **Onboarding tour.** Deleted because its targets no longer render.
   Rebuild against the Foundry shell selectors if a tour is wanted.
