import { useEffect } from 'react';

const DEFAULT_SITE_URL = 'https://sahanpramuditha.me';

const normalizeSiteUrl = (rawUrl) => {
  if (!rawUrl) return DEFAULT_SITE_URL;
  const trimmed = String(rawUrl).trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, '');
};

const upsertMetaTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('meta');
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
};

const upsertLinkTag = (selector, attributes) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement('link');
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => tag.setAttribute(key, value));
};

const SEO = () => {
  useEffect(() => {
    const siteUrl = normalizeSiteUrl(import.meta.env.VITE_SITE_URL || DEFAULT_SITE_URL);
    const canonicalUrl = `${siteUrl}/`;
    const title = 'Sahan Pramuditha | Software Engineer and Creative Developer';
    const description =
      'Sahan Pramuditha is a software engineer and creative developer building accessible, high-performance digital experiences.';
    const ogImage = `${siteUrl}/favicon.svg`;
    const twitterHandle = '@sahanpramuditha';

    document.title = title;

    upsertMetaTag('meta[name="description"]', { name: 'description', content: description });
    upsertMetaTag('meta[name="author"]', { name: 'author', content: 'Sahan Pramuditha' });
    upsertMetaTag('meta[name="application-name"]', { name: 'application-name', content: 'Sahan Pramuditha' });
    upsertMetaTag('meta[name="creator"]', { name: 'creator', content: 'Sahan Pramuditha' });
    upsertMetaTag('meta[name="publisher"]', { name: 'publisher', content: 'Sahan Pramuditha' });
    upsertMetaTag('meta[name="robots"]', { name: 'robots', content: 'index, follow' });

    upsertLinkTag('link[rel="canonical"]', { rel: 'canonical', href: canonicalUrl });

    upsertMetaTag('meta[property="og:type"]', { property: 'og:type', content: 'website' });
    upsertMetaTag('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    upsertMetaTag('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMetaTag('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMetaTag('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    upsertMetaTag('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Sahan Pramuditha' });

    upsertMetaTag('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
    upsertMetaTag('meta[name="twitter:url"]', { name: 'twitter:url', content: canonicalUrl });
    upsertMetaTag('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMetaTag('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMetaTag('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
    upsertMetaTag('meta[name="twitter:site"]', { name: 'twitter:site', content: twitterHandle });
    upsertMetaTag('meta[name="twitter:creator"]', { name: 'twitter:creator', content: twitterHandle });

    // Note: Profile photo preload removed - the image is already set to loading="eager" 
    // in About.jsx, which is sufficient for fast loading. Vite-processed image imports
    // don't work well with preload links, so we rely on eager loading instead.
  }, []);

  return null;
};

export default SEO;
