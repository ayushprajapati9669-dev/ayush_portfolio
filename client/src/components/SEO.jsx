import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePortfolio } from '../app/providers/ThemeProvider';

/**
 * Reusable SEO and Open Graph Optimization Component
 * Sets <title>, standard meta tags, Open Graph (og:*), Twitter cards, canonical links, and JSON-LD schemas.
 * Dynamically falls back to live CMS SEO settings when individual props are omitted.
 */
export function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
  schema = null
}) {
  const location = useLocation();
  let portfolioContext = null;
  try {
    portfolioContext = usePortfolio();
  } catch (_e) {
    portfolioContext = null;
  }
  const appState = portfolioContext?.appState;
  const s = appState?.settings || {};
  const p = appState?.profile || {};

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
    const effectiveBase = s.canonicalUrl ? s.canonicalUrl.replace(/\/+$/, '') : origin;
    const currentUrl = url || `${effectiveBase}${location.pathname}`;

    const effectiveImage = image || s.ogImage || '/og-image.png';
    const fullImageUrl = effectiveImage.startsWith('http')
      ? effectiveImage
      : `${effectiveBase}${effectiveImage.startsWith('/') ? '' : '/'}${effectiveImage}`;

    const resolvedTitle = title || s.seoTitle || s.ogTitle || s.siteTitle;
    const formattedTitle = resolvedTitle
      ? (resolvedTitle.includes('Ayush Prajapati') ? resolvedTitle : `${resolvedTitle} | Ayush Prajapati`)
      : 'Ayush Prajapati | Full-Stack Developer & Computer Science Engineer';

    const resolvedDescription = description || s.seoDescription || s.ogDescription || 'Ayush Prajapati — Full-Stack Developer & Computer Science Student at SISTec Bhopal. Specializing in MERN stack, resilient backend systems, scalable cloud architectures, and algorithmic problem-solving.';
    const resolvedAuthor = s.author || p.displayName || p.name || 'Ayush Prajapati';
    const resolvedRobots = s.robotsIndex || 'index, follow';
    const resolvedSiteName = s.siteName || 'Ayush Prajapati Portfolio';

    // 1. Title
    document.title = formattedTitle;

    // Helper to create or update meta tags
    const setMeta = (attributeName, attributeValue, content) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attributeName}="${attributeValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attributeName, attributeValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // 2. Standard Meta Tags
    setMeta('name', 'description', resolvedDescription);
    setMeta('name', 'author', resolvedAuthor);
    setMeta('name', 'robots', resolvedRobots);
    if (s.seoKeywords) {
      setMeta('name', 'keywords', s.seoKeywords);
    }

    // 3. Open Graph Tags
    setMeta('property', 'og:title', s.ogTitle || formattedTitle);
    setMeta('property', 'og:description', s.ogDescription || resolvedDescription);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:image', fullImageUrl);
    setMeta('property', 'og:site_name', resolvedSiteName);

    // 4. Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', s.ogTitle || formattedTitle);
    setMeta('name', 'twitter:description', s.ogDescription || resolvedDescription);
    setMeta('name', 'twitter:image', fullImageUrl);

    // 5. Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

    // 6. JSON-LD Structured Data Schema
    let jsonLdScript = document.getElementById('seo-jsonld-schema');
    if (schema) {
      if (!jsonLdScript) {
        jsonLdScript = document.createElement('script');
        jsonLdScript.id = 'seo-jsonld-schema';
        jsonLdScript.type = 'application/ld+json';
        document.head.appendChild(jsonLdScript);
      }
      try {
        jsonLdScript.textContent = JSON.stringify(schema);
      } catch (_e) {}
    } else if (jsonLdScript) {
      jsonLdScript.remove();
    }
  }, [title, description, image, url, type, schema, location.pathname, s]);

  return null;
}

export default SEO;
