---
name: brand-extract
description: Extract a lightweight brand theme (accent color, primary font, logo/favicon, site name) from a website URL, so downstream deliverables (audit reports, landing pages, promo videos) can be styled on-brand. Use whenever an engagement provides a brand/website URL and a deliverable should match the client's look.
argument-hint: "<brand-url>"
allowed-tools: WebFetch, Write, Read
---

# Brand Extract

Given a website URL, produce a small structured brand theme other steps can reuse. This is the local-first port of the studio's brand-scraper.

## Steps

1. Fetch the page HTML for `$1` (or the URL the caller gives you) with `WebFetch`.
2. Extract, with regex/inspection of the markup:
   - **accentColor** — `<meta name="theme-color">`, else the dominant brand color referenced in CSS/inline styles.
   - **primaryFont** — the first Google Fonts family (`fonts.googleapis.com/css?family=...` or `<link>`), else the first `font-family` declared.
   - **logo** — `og:image`, else apple-touch-icon, else favicon (absolute URL).
   - **siteName** — `og:site_name`, else `<title>` trimmed of taglines.
3. Fall back gracefully: any field you cannot determine → `null`. Never invent values.
4. Emit the theme as JSON:

```json
{
  "siteName": "Acme Protocol",
  "accentColor": "#E4572E",
  "primaryFont": "Newsreader",
  "logo": "https://acme.xyz/og.png",
  "sourceUrl": "https://acme.xyz"
}
```

If the caller named an output path, write the JSON there; otherwise return it inline for the caller to use.

## Notes

- Keep it lightweight — this is a heuristic scrape, not a render. One fetch, no headless browser.
- Respect `null`s downstream: a renderer should have sane defaults (studio ink/cream/vermilion) when a field is missing.
