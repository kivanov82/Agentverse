# shipwithai.nl — marketing site

The ShipWithAI public site. A **static, dependency-free** page — no build step, no framework, no node app. Just `index.html` + `styles.css` + `app.js` + `assets/`.

## Design provenance

Implemented from the **"Marketing Site — Landing"** template in the *ShipWithAI Design System* Claude Design project (`claude.ai/design/p/3fcbcf72-…`, file `templates/marketing-site/MarketingSite.dc.html`), using its **Aurora** theme (warm cream `#f2ebe0` + coral accent ramp, glass surfaces, living orbs, agent-mesh, self-typing terminal). The design's theme + DS tokens are **baked to plain CSS** (no runtime theming). The design shipped with placeholder copy; the copy here is the real [positioning](../CLAUDE.md) — AI-native delivery studio, the context-layer thesis, the legibility moat — **not** "a terminal tool".

To re-pull or re-theme the design, use the `DesignSync` MCP (`/design-login`) against that project and re-bake the `--sw-*` / `--azure-*` token blocks in `styles.css`.

## Sections

Nav · Hero (orchestrator terminal) · Trust strip · **The shift** (old company → AI-native company) · **How it works** (brief → design → build → deploy → grow → monitor) · **Watch** (the embedded 2-min explainer, `assets/promo.mp4`) · **Services** (the six verticals) · **The moat** (legibility, the readability stack) · Closing statement · Footer.

**Explanatory-only:** no calls to action, no email, no pricing — it's an explainer for now. The only buttons (hero "Watch how it works" / "Read the thesis") are in-page scroll links.

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

- **Explanatory build** — no CTAs, email, or pricing yet. When you're ready to convert, add the engagement/contact flow back (the design system has the components).
- `assets/promo.mp4` is a 720p / faststart web encode of the studio explainer (`engagements/shipwithai-promo-20260627/video/out/promo-v7.mp4`); `assets/promo-poster.jpg` is its poster frame.
- All motion is gated behind `prefers-reduced-motion`.
