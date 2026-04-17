/**
 * Brand scraper — fetches a URL and extracts theme hints (accent color, primary
 * font, logo) from the HTML head. Lightweight regex parsing, no DOM dependency.
 * Used to style audit-report PDFs so they visually match the user's site.
 */

export interface BrandTheme {
  sourceUrl: string;
  primaryColor?: string;
  fontFamily?: string;
  logoUrl?: string;
  siteName?: string;
}

const FETCH_TIMEOUT_MS = 5000;
const MAX_BYTES = 500_000; // ~500KB cap on HTML parse

export async function scrapeBrand(url: string): Promise<BrandTheme | null> {
  const normalized = normalizeUrl(url);
  if (!normalized) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ShipWithAI-BrandScraper/1.0)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    if (!response.ok) return null;

    const html = (await response.text()).slice(0, MAX_BYTES);
    const head = extractHead(html);

    const theme: BrandTheme = {
      sourceUrl: normalized,
      primaryColor: extractThemeColor(head),
      fontFamily: extractGoogleFont(head),
      logoUrl: extractLogo(head, normalized),
      siteName: extractSiteName(head),
    };

    // If we extracted nothing useful, treat as a miss.
    if (!theme.primaryColor && !theme.fontFamily && !theme.logoUrl && !theme.siteName) {
      return null;
    }

    return theme;
  } catch {
    return null;
  }
}

function normalizeUrl(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    const url = trimmed.startsWith('http') ? new URL(trimmed) : new URL(`https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

function extractHead(html: string): string {
  const match = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return match ? match[1] : html.slice(0, 50_000);
}

function extractThemeColor(head: string): string | undefined {
  const m = head.match(/<meta[^>]+name=["']theme-color["'][^>]*content=["']([^"']+)["']/i)
    ?? head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*name=["']theme-color["']/i);
  const raw = m?.[1]?.trim();
  return isValidColor(raw) ? raw : undefined;
}

function isValidColor(value: string | undefined): boolean {
  if (!value) return false;
  return /^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    || /^(rgb|rgba|hsl|hsla)\(/i.test(value);
}

function extractGoogleFont(head: string): string | undefined {
  const linkMatches = head.matchAll(/<link[^>]+href=["']([^"']*fonts\.googleapis\.com[^"']+)["']/gi);
  for (const m of linkMatches) {
    const href = m[1];
    const familyMatch = href.match(/family=([^:&]+)/i);
    if (familyMatch) {
      return decodeURIComponent(familyMatch[1].replace(/\+/g, ' ')).split(',')[0].trim();
    }
  }
  return undefined;
}

function extractLogo(head: string, baseUrl: string): string | undefined {
  const ogImage = head.match(/<meta[^>]+property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image["']/i)?.[1];
  if (ogImage) return resolveUrl(ogImage, baseUrl);

  const icon = head.match(/<link[^>]+rel=["'](?:icon|apple-touch-icon|shortcut icon)["'][^>]*href=["']([^"']+)["']/i)?.[1];
  if (icon) return resolveUrl(icon, baseUrl);

  return undefined;
}

function extractSiteName(head: string): string | undefined {
  const ogSite = head.match(/<meta[^>]+property=["']og:site_name["'][^>]*content=["']([^"']+)["']/i)?.[1]
    ?? head.match(/<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:site_name["']/i)?.[1];
  if (ogSite) return ogSite.trim();

  const title = head.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1];
  return title?.trim() || undefined;
}

function resolveUrl(ref: string, base: string): string | undefined {
  try {
    return new URL(ref, base).toString();
  } catch {
    return undefined;
  }
}
