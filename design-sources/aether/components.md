# Aether — Components & Screens

Design system for the Aether storefront. All values reference `tokens.json`.
Theme is dark-only. Numbers, prices, specs, and labels use **JetBrains Mono**;
everything else uses **Space Grotesk**.

Fidelity priority (per UX handoff): **Product detail → Home → Cart → Checkout → Success**.

---

## Foundations

- **Canvas:** `ink` background with a faint grid (`grid.lineColor`, 64px cells) fading
  to solid at the fold via `gradients.gridFade`. A single `heroGlow` radial sits top-right of the hero only.
- **Surfaces:** content sits on `surface` / `surfaceRaised`; floating UI (drawer, nav on scroll,
  toasts) uses the `glass.panel` recipe (blur + translucent fill + 6%-white hairline).
- **Accent discipline:** teal is for one primary action per view + active/focus states + data emphasis.
  Never flood a screen with teal — it earns attention by being rare.
- **Reveals:** sections fade + rise (`motion.reveal`, 70ms stagger). Respect `prefers-reduced-motion`.

---

## Button

```
Variants
  Primary    bg accent · text accentInk · hover bg accentHover · pressed accentPressed · shadow glowSoft on hover
  Secondary  bg surfaceRaised · text text · border 1px border · hover border borderStrong
  Ghost      transparent · text textMuted · hover text text + bg accentSoft
  Danger     transparent · text error · border 1px error/40 · hover bg error/10

Sizes      sm: 8px 14px / sm   ·   md: 11px 18px / base   ·   lg: 15px 26px / lg
Radius     md (0.625rem)
States     default · hover · active(translateY 1px) · focus(2px focusRing offset 2px) · disabled(opacity .45, no pointer) · loading(spinner, label hidden, width locked)
```

## Header / Nav (sticky)

- Left: **Aether** wordmark (Space Grotesk, bold) with a 6px teal dot glyph.
- Center/right: `Shop`, `Sensors`, `Kits`, `Support` links — `textMuted`, hover `text`, active gets a 2px `accentLine` underline.
- Right: search icon, **cart button** with a live mono count badge (teal pill).
- **Scroll state:** transparent over hero → on scroll past 80px collapses to `glass.panel` with bottom hairline.
- Mobile: wordmark + cart + hamburger; nav opens as a full-height glass sheet.

## Hero

- Eyebrow (mono, `label` tracking): `SMART HOME · MATTER-NATIVE`.
- Headline: **"Your home, aware."** (`hero` role, two lines, tight tracking).
- Sub: one-line value prop, `textMuted`, max ~52ch.
- CTAs: Primary `Shop the system` + Ghost `Explore the Hub →`.
- Visual: product render in a glass frame with `heroGlow` behind + thin animated `accentLine` scan.
- Trust strip below: mono micro-labels — `2-YR WARRANTY` · `FREE RETURNS` · `SECURE CHECKOUT` · `MATTER / HOMEKIT / ALEXA`.

## ProductCard

```
Structure   image (4:3, glass-framed) · category eyebrow (mono) · name (h3) · spec hook (mono, 1 line) · price (mono price role) · quick-add
Quick-add   appears on hover/focus (desktop) / always visible (touch) — bottom-right circular + button, accent on hover
States
  default    border border · subtle inner sheen
  hover      border borderAccent · lift translateY(-4px) · shadow md + glowSoft · image scale 1.03
  focus      focusRing
  out-of-stock  image dimmed (.5) · "NOTIFY ME" ghost replaces add · mono "OUT OF STOCK" tag (warning, with icon — never color alone)
  featured   thin top accentLine + "FEATURED" mono tag
  loading    skeleton: shimmer block on dark glass for image + 2 text bars
```
Spec hook examples (real): Hub Pro → `Wi-Fi 6 · Zigbee · Thread`; Multi-Sensor Pro → `Motion · Temp · Humidity · Lux`; Starter Kit → `Hub + 5 devices · 3 rooms`.

## ProductGrid

- 12-col container, `maxWidth` 1200px. Cards: 4-up (desktop) → 2-up (tablet) → 1-up (mobile), gap `6`.
- **Featured row** first (Hub Pro, Starter Kit, Multi-Sensor Pro, Smart Bulb), then full catalog.
- Controls bar: category chips (`Hubs · Kits · Sensors · Plugs · Lighting`) + sort select (mono).
  Active chip = accentSoft fill + accent text.
- Empty: "No devices match" + clear-filters ghost. Error: retry card.

## ProductPage

- Two columns desktop: **media left** (sticky gallery — main 4:3 + thumb strip + context/room shot placeholder), **buy panel right** (`glass.card`).
- Buy panel: category eyebrow · name (h1) · positioning line · **price (mono)** · stock indicator
  (`IN STOCK · SHIPS IN 2 DAYS`, success dot + label) · quantity stepper · sticky **Add to Cart** (primary, lg).
- **Spec table** (real `<table>` semantics, mono values, zebra via surface/surfaceRaised rows):
  rows from the product's `specs` (connectivity, processor, power, dimensions, compatibility…).
- **Works-with row** — pinned chips: `Matter · Apple Home · Google Home · Alexa` (#1 buyer question, give it weight).
- "What's in the box" list · warranty/returns note · **related/bundle** strip (2–3 cross-sells).
- Mobile: media → buy summary → sticky bottom Add-to-Cart bar (price + button).
- Loading: image + spec-row skeletons. Out-of-stock: Notify-me, disabled stepper.

## Spec Table

```
Layout    2-col: label (textMuted, sentence-case) | value (text, JetBrains Mono)
Rows      alternating surface / surfaceRaised; 1px border between
Wrapping  long values (connectivity strings) wrap; "·" separators preserved
A11y      real table/th/td; caption "Technical specifications"
```

## CartDrawer (slide-in)

- Triggered by add-to-cart / cart icon. Right-side `glass.panel`, width 420px (full-width mobile), slides in `motion.slow`.
- Header: `YOUR CART (n)` mono + close. Focus trapped, ESC closes, scrim dims canvas.
- Line item: thumb · name · unit price (mono) · qty stepper · remove (ghost danger).
- Footer (sticky): subtotal (mono), shipping note (`FREE over $50` / `$4.99`), reassurance line,
  **Checkout** primary (lg, full-width) + `Continue shopping` ghost.
- **Added-to-cart confirm:** brief success pulse on the new line + live-region announce.
- Empty: centered glyph + "Your cart is empty" + `Browse devices` primary.

## Checkout

- Two-column desktop: **form left**, **sticky order summary right** (`glass.card`). Stacked mobile w/ collapsible summary at top.
- **Stripe TEST badge** up top: amber `warning` chip, icon + `TEST MODE — no real charge`.
- Sections: Contact · Shipping address · Payment (Stripe Elements container — no custom card UI).
- Inputs: surfaceRaised fill, 1px border, focus borderAccent + focusRing, mono for numeric fields. Inline errors (error + icon).
- Summary: line items, subtotal, shipping, **tax (8%)**, total (mono, emphasized) · edit-cart link.
- CTA: single **Pay $X** primary (lg). Loading = spinner + disabled. Error = inline recovery, form data preserved.

## Success

- Centered: large success check (teal ring + glow) · `ORDER CONFIRMED` eyebrow · order number (mono, copyable).
- Itemized summary card · estimated delivery (mono date) · next steps (`Set up your Hub` / app teaser) · `Continue shopping`.

## Footer

- 4 columns: Product · Support · Company · Stay aware (email capture, mono input + arrow button).
- Faint top grid line; wordmark + tagline; mono legal row + works-with badges. `textFaint` body, `textMuted` links.

---

## Global states & a11y

- **Focus:** 2px `focusRing`, 2px offset, on every interactive element.
- **Color independence:** stock/error/test states always pair an icon + text label with color.
- **Contrast (verified):** text on ink/surface ≫ AA; accent on ink ≈ 8.5:1; muted on surface ≈ 6.5:1; semantic colors are bright variants that clear 4.5:1.
- **Tap targets:** ≥44px. **Motion:** all reveals/transitions disabled under `prefers-reduced-motion`.
