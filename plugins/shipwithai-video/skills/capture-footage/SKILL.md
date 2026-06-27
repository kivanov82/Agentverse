---
name: capture-footage
description: Capture screenshots (and short clips) of real deliverables to use as video footage — browser screenshots via Playwright, operator screen recordings (terminal, the Claude Design canvas, live storefronts), and markdown deliverables rendered to a branded HTML page (render-md.mjs) then screenshotted. Use before composing a marketing video.
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

## 2. Operator screen recordings — terminal, Claude Design canvas, anything not Playwright-drivable
Some of the best footage is live and login-gated, so the **operator records it** (you direct exactly what + when):
- **Terminal** — a multi-agent run, the `/workflows` progress tree, PM handoffs.
- **Claude Design canvas** (`claude.ai/design`) — screens building from the imported repo. This is the design hero shot; the canvas is behind a login, so Playwright can't drive it.
- **A live storefront** in a real browser when you want human-paced scrolling.

macOS: `Cmd+Shift+5` → record window/region → save `.mov` into `engagements/<slug>/clips/`. Transcode: `ffmpeg -i clip.mov -vf scale=1920:-2 -r 30 clip.mp4`. These become `clip` scenes (fast-forwarded in `remotion-compose`). Record at normal speed — speed-up happens in Remotion.

## 3. Markdown deliverables → branded HTML → screenshot
Audit reports, SEO reports, campaign plans are markdown. To show them as a real-looking document, use the bundled zero-dependency renderer:
```
node ${CLAUDE_PLUGIN_ROOT}/skills/capture-footage/render-md.mjs <in.md> <out.html> [accent] [font] [title]
```
It emits a single styled HTML page on the brand theme (accent headings on paper, the display font, styled tables/code/quotes). Then screenshot it — but the Playwright MCP **blocks `file://`**, so serve the file over localhost first:
```
npx --yes http-server engagements/<slug>/shots -p 8080   # or: python3 -m http.server 8080
```
then `browser_navigate http://localhost:8080/out.html` → `browser_resize 1920×1080` → `browser_take_screenshot`. Produces a polished "report" still without exposing raw markdown.

## Tips
- Consistent dimensions across all shots so they compose cleanly.
- Prefer hero/above-the-fold framing — the video shows them for only 2–4s.
- Name files for the scene that uses them (e.g. `shot-audit-report.png`, `shot-store-home.png`).
- Capture more than you need; pick the best in `remotion-compose`.

## For the ShipWithAI self-promo
The studio's own deliverables are the footage. The full shot list, brand briefs, and frame-accurate storyboard live in **`docs/promo-script.md`** — follow it. In short: terminal + Claude Design canvas + live storefronts as `clip` recordings; audit/SEO/campaign reports rendered to branded HTML → `showcase` stills; paired with `stat` counters and `message` cards for the fleet narrative.
