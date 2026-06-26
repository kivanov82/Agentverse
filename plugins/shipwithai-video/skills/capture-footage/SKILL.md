---
name: capture-footage
description: Capture screenshots (and short clips) of real deliverables to use as video footage — browser screenshots via Playwright, Figma frame renders, and markdown deliverables rendered to a branded HTML page then screenshotted. Use before composing a marketing video.
allowed-tools: Read, Write, Edit, Bash, mcp__plugin_playwright_playwright__browser_navigate, mcp__plugin_playwright_playwright__browser_take_screenshot, mcp__plugin_playwright_playwright__browser_resize, mcp__plugin_playwright_playwright__browser_snapshot
---

# Capture Footage

Gather crisp visuals of real deliverables for a marketing video. Save everything into `engagements/<slug>/shots/` at 1920×1080 (or 1080×1920 for vertical). Three capture sources:

## 1. Browser capture (Playwright) — for anything that renders in a browser
A built storefront, a deployed site, an HTML report.
- `browser_resize` to 1920×1080 (retina/deviceScaleFactor 2 if available) for crisp output.
- `browser_navigate` to the URL (or a local `file://` / `http://localhost:3000`).
- `browser_take_screenshot` — full-page or a specific element. Capture a few states (homepage, a product page, the cart) for variety.
- For **motion** (an actual screen recording rather than stills), write a tiny Playwright script using the library directly with `recordVideo: { dir, size }` on the browser context, drive the page (scroll/click), then close the context to flush the `.webm`. Convert to mp4 if needed with the ffmpeg Remotion provides.

## 2. Figma capture — for design boards/mockups
Use `get_screenshot` on a Figma node/frame to render it to an image. Ties into the two-way Claude Design work — the ui-designer's pushed frames become footage.

## 3. Markdown deliverables → branded HTML → screenshot
Audit reports, SEO reports, campaign plans are markdown. To show them as a real-looking document:
1. Render the `.md` to a single styled HTML page (simple inline CSS using the brand theme — accent headings on a paper background, the serif display font). A short Node/`pandoc` step, or just wrap the HTML by hand.
2. Open it with Playwright (`browser_navigate file://…`) and `browser_take_screenshot` (full-page, then crop to a hero section).
This produces a polished "report" still without exposing raw markdown.

## Tips
- Consistent dimensions across all shots so they compose cleanly.
- Prefer hero/above-the-fold framing — the video shows them for only 2–4s.
- Name files for the scene that uses them (e.g. `shot-audit-report.png`, `shot-store-home.png`).
- Capture more than you need; pick the best in `remotion-compose`.

## For the ShipWithAI self-promo
The studio's own deliverables are the footage: the audit report (render its `report.md` to branded HTML → screenshot), a built storefront (`browser_navigate` the local dev server → screenshot), an SEO/campaign report (HTML → screenshot). Pull from existing `engagements/` — pair these real stills with the animated `grid`/`message` scenes for the agent fleet.
