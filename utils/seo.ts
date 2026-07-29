export interface HeadingItem {
  level: number;
  text: string;
}

export interface SeoData {
  url: string;
  hostname: string;
  favicon: string | null;
  title: string;
  metaDescription: string | null;
  canonical: string | null;
  robots: string | null;
  viewport: string | null;
  charset: string | null;
  lang: string | null;
  og: Record<string, string>;
  twitter: Record<string, string>;
  headings: HeadingItem[];
  h1Count: number;
  wordCount: number;
  imagesTotal: number;
  imagesMissingAlt: number;
  jsonLdTypes: string[];
}

export const GET_SEO_DATA = 'GET_SEO_DATA' as const;

export interface GetSeoDataMessage {
  type: typeof GET_SEO_DATA;
}

function getMetaContent(doc: Document, selector: string): string | null {
  const value = doc.querySelector(selector)?.getAttribute('content');
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function extractSeoData(doc: Document = document): SeoData {
  const title = doc.title?.trim() ?? '';
  const metaDescription = getMetaContent(doc, 'meta[name="description" i]');
  const canonical = doc.querySelector('link[rel="canonical" i]')?.getAttribute('href') ?? null;
  const robots = getMetaContent(doc, 'meta[name="robots" i]');
  const viewport = getMetaContent(doc, 'meta[name="viewport" i]');
  const charset = doc.characterSet ?? doc.querySelector('meta[charset]')?.getAttribute('charset') ?? null;
  const lang = doc.documentElement.getAttribute('lang');

  const og: Record<string, string> = {};
  doc.querySelectorAll('meta[property^="og:" i]').forEach((el) => {
    const prop = el.getAttribute('property');
    const content = el.getAttribute('content');
    if (prop && content) og[prop] = content;
  });

  const twitter: Record<string, string> = {};
  doc.querySelectorAll('meta[name^="twitter:" i]').forEach((el) => {
    const name = el.getAttribute('name');
    const content = el.getAttribute('content');
    if (name && content) twitter[name] = content;
  });

  const headings: HeadingItem[] = [];
  doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((el) => {
    const text = el.textContent?.trim().replace(/\s+/g, ' ') ?? '';
    if (text) headings.push({ level: Number(el.tagName[1]), text });
  });
  const h1Count = headings.filter((h) => h.level === 1).length;

  const bodyText = doc.body?.innerText?.trim() ?? '';
  const wordCount = bodyText ? bodyText.split(/\s+/).length : 0;

  const images = doc.querySelectorAll('img');
  let imagesMissingAlt = 0;
  images.forEach((img) => {
    if (!img.getAttribute('alt')?.trim()) imagesMissingAlt++;
  });

  const jsonLdTypes: string[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    try {
      const data = JSON.parse(el.textContent ?? '');
      for (const item of Array.isArray(data) ? data : [data]) {
        const t = item?.['@type'];
        if (typeof t === 'string') jsonLdTypes.push(t);
        else if (Array.isArray(t)) jsonLdTypes.push(...t.filter((x) => typeof x === 'string'));
      }
    } catch {
      // malformed JSON-LD, skip
    }
  });

  const faviconHref = doc.querySelector('link[rel~="icon" i]')?.getAttribute('href') ?? null;
  const favicon = faviconHref ? new URL(faviconHref, doc.baseURI).href : null;

  return {
    url: doc.location?.href ?? '',
    hostname: doc.location?.hostname ?? '',
    favicon,
    title,
    metaDescription,
    canonical,
    robots,
    viewport,
    charset,
    lang,
    og,
    twitter,
    headings,
    h1Count,
    wordCount,
    imagesTotal: images.length,
    imagesMissingAlt,
    jsonLdTypes: Array.from(new Set(jsonLdTypes)),
  };
}
