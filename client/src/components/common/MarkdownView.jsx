import React, { useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked options
marked.setOptions({
  gfm: true,
  breaks: true,
  headerIds: false,
  mangle: false
});

/**
 * Renders sanitized markdown using 'marked' and 'DOMPurify'
 * Justification: 'marked' is lightweight (~30KB), robust and fast at compile/runtime;
 * coupled with DOMPurify, it guarantees complete XSS defense while allowing rich GFM
 * features (tables, code blocks, bold callouts, lists) without heavy React AST dependencies.
 */
export function MarkdownView({ content, className = '' }) {
  const sanitizedHtml = useMemo(() => {
    if (!content || typeof content !== 'string') return '';
    try {
      const rawHtml = marked.parse(content);
      return DOMPurify.sanitize(rawHtml, {
        USE_PROFILES: { html: true },
        ALLOWED_TAGS: [
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'b', 'i', 'strong', 'em', 'strike',
          'code', 'pre', 'ul', 'ol', 'li', 'blockquote', 'hr', 'a', 'span', 'br', 'table',
          'thead', 'tbody', 'tr', 'th', 'td'
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'title']
      });
    } catch (err) {
      console.error('Error parsing markdown:', err);
      return '';
    }
  }, [content]);

  if (!sanitizedHtml) return null;

  return (
    <div
      className={`markdown-content prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm sm:text-base ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
