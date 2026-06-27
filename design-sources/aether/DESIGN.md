# Aether — Design Brief for the Canvas

> Read this with `tokens.json` (the visual contract) and `components.md` (the parts list).
> Design the screens on the Claude Design canvas in this voice. `tokens.json` is authoritative —
> if a value here and a token ever disagree, the token wins.

## What Aether is

A smart-home hardware brand — hubs, sensors, and automation kits. The promise is calm,
ambient intelligence: **"Your home, aware."** The product is technical, so the storefront
must feel *precise and confident*, not cute. This audience (tech-forward, 25–45) buys on
specs and compatibility — so the design treats data as a first-class visual element.

## The direction: "Instrument Panel"

Think the interface of a beautifully engineered device, not a typical store. Near-black
glass, a single electric-teal signal color, real readouts in monospace. Every screen should
feel like it's *running* — alive, measured, in control. Premium tech, dark room, soft glow.

## Mood

- **Dark & deep.** Near-black `ink` canvas. The room is dark; the product (and the teal) glows.
- **Glass & depth.** Floating panels with blur and a 6%-white hairline. Layers, not flatness.
- **Engineered grid.** A faint structural grid underlies the page and fades out below the hero —
  a sense of measurement and order.
- **Teal as a signal.** `accent` #15C2A5 is the one bright thing: the primary action, the live
  cart count, the active filter, the data highlight. It's powerful because it's scarce.
- **Specs are the hero content.** Monospace prices and spec tables aren't an afterthought — they
  are the texture of the brand. Lean into clean, scannable rows of real numbers.

## Type

- **Space Grotesk** for everything expressive — headlines tight and bold, set big in the hero.
- **JetBrains Mono** for all numerics and labels: prices, spec values, eyebrows (uppercase,
  wide `label` tracking), cart counts, order numbers, the test-mode badge.
- The display/mono pairing *is* the identity. Don't substitute system fonts.

## Do

- Set the hero headline large and confident with a single teal-glow source behind the product.
- Use glass panels for the cart drawer, sticky nav (on scroll), and the checkout summary.
- Show **real product names, prices, and specs** from the catalog — never Lorem Ipsum.
- Give the spec table and the "works-with" compatibility row real prominence on the product page.
- Design empty / loading / error states (skeletons shimmer on dark glass).
- Keep generous negative space; let the few teal moments breathe.

## Don't

- No purple-on-white, no generic SaaS gradients, no Inter/Roboto/Arial.
- Don't drown the screen in teal — one primary action per view.
- Don't use color alone for stock/error/test status (always pair an icon + label).
- Don't make it busy. Restraint reads as premium here.

## Motion (note for the build; show as static + hover on canvas)

- Page-load: sections fade + rise 16px, staggered ~70ms, `entrance` easing.
- Product cards: lift + faint teal glow + image scale on hover.
- A thin `accentLine` scan animates once across the hero visual.
- Cart drawer slides from the right over a dimming scrim; success page check draws + glows.
- All of it respects `prefers-reduced-motion`.

## Reference vibes

1. **Teenage Engineering / Nothing** product pages — engineered minimalism, mono labels, hardware shown like instruments.
2. **Linear & Vercel dark dashboards** — near-black surfaces, crisp glass, a single confident accent, faint grids.
3. **A pro audio mixer / synth UI in a dark studio** — precise readouts, soft backlight glow, everything legible and in its place.

## Screens to lay out (priority order)

Product detail (spec table + works-with) → Home (hero + featured grid + trust strip) →
Cart drawer + cart page → Checkout (Stripe test badge, sticky summary) → Success.
Plus the empty/loading/error states from `components.md`.
