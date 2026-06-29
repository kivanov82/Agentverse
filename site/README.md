# shipwithai.nl — marketing site

The ShipWithAI public site. A **static, dependency-free** page — no build step, no framework, no node app. Just `index.html` + `styles.css` + `app.js` + `assets/`.

## Design provenance

Implemented from the **"Marketing Site — Landing"** template in the *ShipWithAI Design System* Claude Design project (`claude.ai/design/p/3fcbcf72-…`, file `templates/marketing-site/MarketingSite.dc.html`), using its **Aurora** theme (warm cream `#f2ebe0` + coral accent ramp, glass surfaces, living orbs, agent-mesh, self-typing terminal). The design's theme + DS tokens are **baked to plain CSS** (no runtime theming). The design shipped with placeholder copy; the copy here is the real [positioning](../CLAUDE.md) — AI-native delivery studio, the context-layer thesis, the legibility moat — **not** "a terminal tool".

To re-pull or re-theme the design, use the `DesignSync` MCP (`/design-login`) against that project and re-bake the `--sw-*` / `--azure-*` token blocks in `styles.css`.

## Sections

Nav · Hero (orchestrator terminal) · Trust strip · **The shift** (old company → AI-native company) · **How it works** (brief → design → build → deploy → grow → monitor) · **Services** (the six verticals) · **The moat** (legibility, the readability stack) · **Engagement** (per-engagement pricing) · CTA · Footer.

## Run locally

```bash
cd site && npx http-server . -p 8092   # or any static server; open localhost:8092
```

## Deploy

Static — point any host at this folder.

```bash
cd site && npx vercel --prod        # Vercel auto-detects a static site (no build)
```

Fonts load from Google Fonts (CDN). The favicon + logo is `assets/swai-mark.svg`.

## Notes

- **Pricing figures (€4k / €12k) are placeholders** carried from the design — set real numbers before going live.
- CTAs point at `mailto:hello@shipwithai.nl` — wire to the real contact/booking flow when ready.
- All motion is gated behind `prefers-reduced-motion`.
