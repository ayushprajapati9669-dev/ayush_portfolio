import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reusable SEO and Open Graph Optimization Component
 * Sets <title>, standard meta tags, Open Graph (og:*), Twitter cards, canonical links, and JSON-LD schemas.
 */
export function SEO({
  title,
  description = 'Ayush Prajapati — Full-Stack Developer & Computer Science Student at SISTec Bhopal. Specializing in MERN stack, resilient backend systems, scalable cloud architectures, and algorithmic problem-solving.',
  image = '/og-image.png',
  url,
  type = 'website',
  schema = null
}) {
  const location = useLocation();

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ayushprajapati.dev';
    const currentUrl = url || `${origin}${location.pathname}`;
    const fullImageUrl = image.startsWith('http') ? image : `${origin}${image.startsWith('/') ? '' : '/'}${image}`;
    const formattedTitle = title
      ? (title.includes('Ayush Prajapati') ? title : `${title} | Ayush Prajapati`)
      : 'Ayush Prajapati | Full-Stack Developer & Computer Science Engineer';

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
    setMeta('name', 'description', description);
    setMeta('name', 'author', 'Ayush Prajapati');
    setMeta('name', 'robots', 'index, follow');

    // 3. Open Graph Tags
    setMeta('property', 'og:title', formattedTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', currentUrl);
    setMeta('property', 'og:image', fullImageUrl);
    setMeta('property', 'og:site_name', 'Ayush Prajapati Portfolio');

    // 4. Twitter Cards
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', formattedTitle);
    setMeta('name', 'twitter:description', description);
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
  }, [title, description, image, url, type, schema, location.pathname]);

  return null;
}

export default SEO;
