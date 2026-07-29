import { useCallback, useEffect, useState } from 'react';
import type { Browser } from 'wxt/browser';
import { GET_SEO_DATA, type SeoData } from '@/utils/seo';
import './App.css';

type Status = 'loading' | 'ready' | 'error';

function useActiveTabSeoData() {
  const [data, setData] = useState<SeoData | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setStatus('loading');
    try {
      const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tab?.id) throw new Error('No active tab found.');
      const result = (await browser.tabs.sendMessage(tab.id, {
        type: GET_SEO_DATA,
      })) as SeoData | undefined;
      if (!result) throw new Error('Empty response from page.');
      setData(result);
      setStatus('ready');
    } catch {
      setError(
        "Can't read this page. Browser-internal pages (chrome://, the Web Store, etc.) are blocked, " +
          'and a tab opened before the extension was installed needs a reload first.',
      );
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    refresh();
    const onActivated = () => refresh();
    const onUpdated = (_tabId: number, info: Browser.tabs.OnUpdatedInfo) => {
      if (info.status === 'complete') refresh();
    };
    browser.tabs.onActivated.addListener(onActivated);
    browser.tabs.onUpdated.addListener(onUpdated);
    return () => {
      browser.tabs.onActivated.removeListener(onActivated);
      browser.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [refresh]);

  return { data, status, error, refresh };
}

function lengthStatus(len: number, max: number): 'ok' | 'warn' {
  if (len === 0 || len > max) return 'warn';
  return 'ok';
}

function breadcrumbFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    return segments.length ? segments.join(' › ') : '';
  } catch {
    return '';
  }
}

function Header({ data, loading, onRefresh }: { data: SeoData | null; loading: boolean; onRefresh: () => void }) {
  return (
    <header className="header">
      <div className="header-identity">
        {data?.favicon && <img className="favicon" src={data.favicon} alt="" />}
        <span className="hostname">{data?.hostname || 'SEO Debugger'}</span>
      </div>
      <button className="refresh-btn" onClick={onRefresh} disabled={loading} title="Re-scan this page">
        {loading ? '…' : '⟳'}
      </button>
    </header>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="panel error-state">
      <p>{message}</p>
      <button onClick={onRetry}>Try again</button>
    </div>
  );
}

function TitleDescriptionAudit({ data }: { data: SeoData }) {
  const titleLen = data.title.length;
  const descLen = data.metaDescription?.length ?? 0;
  const titleStatus = lengthStatus(titleLen, 60);
  const descStatus = data.metaDescription ? lengthStatus(descLen, 160) : 'warn';

  return (
    <section className="panel">
      <h2>Title &amp; Description</h2>
      <div className="field">
        <div className="field-label">
          Title <span className={`char-count ${titleStatus}`}>{titleLen} / 60</span>
        </div>
        <div className="field-value">{data.title || <em>Missing</em>}</div>
      </div>
      <div className="field">
        <div className="field-label">
          Meta description <span className={`char-count ${descStatus}`}>{descLen} / 160</span>
        </div>
        <div className="field-value">{data.metaDescription || <em>Missing</em>}</div>
      </div>
    </section>
  );
}

function SerpCard({ data }: { data: SeoData }) {
  const breadcrumb = breadcrumbFromUrl(data.url);
  return (
    <section className="panel">
      <h2>Google Search Preview</h2>
      <div className="serp-card">
        <div className="serp-url-row">
          {data.favicon && <img className="favicon" src={data.favicon} alt="" />}
          <div className="serp-url-text">
            <div className="serp-hostname">{data.hostname}</div>
            {breadcrumb && <div className="serp-breadcrumb">{breadcrumb}</div>}
          </div>
        </div>
        <div className="serp-title">{data.title || 'Untitled page'}</div>
        <div className="serp-description">{data.metaDescription || 'No meta description found.'}</div>
      </div>
    </section>
  );
}

function SocialImage({ src, alt }: { src: string | undefined; alt: string }) {
  if (!src) {
    return <div className="social-image social-image-placeholder">No image tag found</div>;
  }
  return <img className="social-image" src={src} alt={alt} />;
}

function OgCard({ data }: { data: SeoData }) {
  const title = data.og['og:title'] || data.title;
  const description = data.og['og:description'] || data.metaDescription || '';
  const siteName = data.og['og:site_name'] || data.hostname;

  return (
    <section className="panel">
      <h2>Open Graph Preview</h2>
      <div className="social-card">
        <SocialImage src={data.og['og:image']} alt={title} />
        <div className="social-body">
          <div className="social-domain">{siteName.toUpperCase()}</div>
          <div className="social-title">{title}</div>
          {description && <div className="social-description">{description}</div>}
        </div>
      </div>
      {Object.keys(data.og).length === 0 && <p className="hint">No og:* meta tags found on this page.</p>}
    </section>
  );
}

function TwitterCard({ data }: { data: SeoData }) {
  const hasTwitterTags = Object.keys(data.twitter).length > 0;
  const cardType = data.twitter['twitter:card'] || (data.og['og:image'] ? 'summary_large_image' : 'summary');
  const title = data.twitter['twitter:title'] || data.og['og:title'] || data.title;
  const description = data.twitter['twitter:description'] || data.og['og:description'] || data.metaDescription || '';
  const image = data.twitter['twitter:image'] || data.og['og:image'];
  const isLarge = cardType.includes('large_image');

  return (
    <section className="panel">
      <h2>Twitter / X Preview</h2>
      <div className={`social-card twitter-card ${isLarge ? '' : 'twitter-summary'}`}>
        <SocialImage src={image} alt={title} />
        <div className="social-body">
          <div className="social-title">{title}</div>
          {description && <div className="social-description">{description}</div>}
          <div className="social-domain">{data.hostname}</div>
        </div>
      </div>
      {!hasTwitterTags && (
        <p className="hint">
          No twitter:* tags found{data.og['og:image'] ? ' — falling back to Open Graph tags.' : '.'}
        </p>
      )}
    </section>
  );
}

function Check({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'ok' | 'warn' | 'info';
  detail: string;
}) {
  const icon = status === 'ok' ? '✓' : status === 'warn' ? '⚠' : 'ℹ';
  return (
    <li className={`seo-check ${status}`}>
      <span className="seo-check-icon">{icon}</span>
      <span className="seo-check-label">{label}</span>
      <span className="seo-check-detail">{detail}</span>
    </li>
  );
}

function Checklist({ data }: { data: SeoData }) {
  const robotsBlocked = data.robots?.toLowerCase().includes('noindex') ?? false;

  return (
    <section className="panel">
      <h2>Meta Checklist</h2>
      <ul className="check-list">
        <Check label="Canonical" status={data.canonical ? 'ok' : 'warn'} detail={data.canonical || 'Missing'} />
        <Check
          label="Robots"
          status={robotsBlocked ? 'warn' : 'ok'}
          detail={data.robots || 'Not set (defaults to index, follow)'}
        />
        <Check label="Viewport" status={data.viewport ? 'ok' : 'warn'} detail={data.viewport || 'Missing'} />
        <Check
          label="Charset"
          status={data.charset?.toLowerCase().includes('utf-8') ? 'ok' : 'warn'}
          detail={data.charset || 'Missing'}
        />
        <Check label="Lang attribute" status={data.lang ? 'ok' : 'warn'} detail={data.lang || 'Missing'} />
        <Check
          label="H1 tags"
          status={data.h1Count === 1 ? 'ok' : 'warn'}
          detail={data.h1Count === 0 ? 'None found' : `${data.h1Count} found`}
        />
        <Check
          label="Image alt text"
          status={data.imagesMissingAlt === 0 ? 'ok' : 'warn'}
          detail={`${data.imagesMissingAlt} / ${data.imagesTotal} missing alt`}
        />
        <Check
          label="Structured data (JSON-LD)"
          status={data.jsonLdTypes.length > 0 ? 'ok' : 'info'}
          detail={data.jsonLdTypes.length > 0 ? data.jsonLdTypes.join(', ') : 'None found'}
        />
        <Check label="Word count" status="info" detail={`${data.wordCount} words`} />
      </ul>
    </section>
  );
}

function HeadingsOutline({ data }: { data: SeoData }) {
  return (
    <section className="panel">
      <h2>Headings Outline</h2>
      {data.headings.length === 0 && <p className="hint">No headings found on this page.</p>}
      <ul className="headings-list">
        {data.headings.map((h, i) => (
          <li key={i} style={{ paddingLeft: `${(h.level - 1) * 12}px` }}>
            <span className="heading-tag">H{h.level}</span>
            {h.text}
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const { data, status, error, refresh } = useActiveTabSeoData();

  return (
    <div className="app">
      <Header data={data} loading={status === 'loading'} onRefresh={refresh} />
      {status === 'error' && <ErrorState message={error!} onRetry={refresh} />}
      {data && status !== 'error' && (
        <>
          <TitleDescriptionAudit data={data} />
          <SerpCard data={data} />
          <OgCard data={data} />
          <TwitterCard data={data} />
          <Checklist data={data} />
          <HeadingsOutline data={data} />
        </>
      )}
    </div>
  );
}

export default App;
