---
name: ai-discoverability
description: Make a site legible to AI assistants and answer engines (ChatGPT, Claude, Perplexity, Google AI) as well as classic search — llms.txt, AI-crawler robots policy, JSON-LD structured data, canonical/OG/Twitter tags, sitemap. Use during an SEO engagement, after any site build/deploy, or whenever a client asks "why doesn't ChatGPT/Google know about us?".
allowed-tools: Read, Grep, Glob, Write, Edit, Bash, WebFetch
---

# AI Discoverability

Answer engines now sit between many buyers and websites. A site that ranks but can't be *quoted* — no machine-readable summary, no structured data, AI crawlers blocked — loses those conversations. This skill makes a site citable by both kinds of engines: search (crawl → rank) and answer (read → synthesize → cite).

Reference implementation: `site/` in this repo (shipwithai.nl) — head tags, `robots.txt`, `sitemap.xml`, `llms.txt`.

## Checklist (apply in order, skip what exists)

### 1. `llms.txt` — the AI-facing summary
A markdown file at the site root, per llmstxt.org: `# Name`, a `>` blockquote stating what the business is in 2–3 sentences, then sections (`## What ships`, `## Method`, `## Links`, …) with the facts an assistant should repeat. Rules:
- Write it from the site's **published** copy only — never introduce claims or numbers that aren't already public.
- Facts over adjectives: services, method, proof points, founder, links. An assistant should be able to answer "what do they do, how, and how do I contact them" from this file alone.
- Multi-page sites: link each key page with a one-line description; optionally add `llms-full.txt` with full page text.

### 2. `robots.txt` — welcome the AI crawlers explicitly
`User-agent: *` `Allow: /`, plus explicit `Allow` blocks for: `GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-Web`, `anthropic-ai`, `PerplexityBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`. End with the `Sitemap:` line. (If the client *doesn't* want to be AI training data but does want citations, allow the search/user-triggered agents — OAI-SearchBot, ChatGPT-User, PerplexityBot — and disallow the training ones — GPTBot, Google-Extended, CCBot; make this an explicit client decision.)

### 3. JSON-LD structured data
One `<script type="application/ld+json">` with an `@graph`: `Organization`/`ProfessionalService` (name, url, logo, description, founder, `sameAs` to real profiles, `makesOffer` per service) + `WebSite`, plus content types where they exist (`VideoObject`, `Article`, `FAQPage`, `Product`). Validate: https://validator.schema.org / Google Rich Results Test. Only assert what the page already says.

### 4. Head tags
- `<link rel="canonical">` (absolute, matching the canonical host — mind www/apex redirects).
- OG complete: `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name`, `og:image` (absolute URL, ~1200×630) + `og:image:alt`.
- `twitter:card` `summary_large_image` + title/description/image.
- Descriptive `<title>` (~60 chars) and `meta description` (~155 chars) stating what the business does — assistants read these verbatim.

### 5. `sitemap.xml`
All canonical URLs with `lastmod`. Reference it from robots.txt. Update `lastmod` on meaningful content changes.

### 6. Content legibility (the part tags can't fix)
- One `<h1>` naming what the business does; heading hierarchy that reads as an outline.
- Real text in the DOM (no text-in-images for key claims); `alt` on meaningful images.
- Proof points as concrete numbers and nouns — answer engines quote specifics, not slogans.

## Verify after deploy

```bash
curl -s https://<site>/robots.txt | head -5
curl -s https://<site>/llms.txt | head -5
curl -s https://<site>/sitemap.xml | grep -c '<loc>'
curl -s https://<site>/ | grep -c 'application/ld+json'
```

Then fetch the OG image URL (must be 200 and absolute) and run the page through validator.schema.org. For an engagement, record the before/after in `engagements/<slug>/growth/ai-discoverability.md`.
