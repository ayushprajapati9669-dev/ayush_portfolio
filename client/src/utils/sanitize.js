import DOMPurify from 'dompurify';

/**
 * Universal safe HTML sanitizer for rich text descriptions and case study content.
 * Prevents Stored Cross-Site Scripting (XSS) while preserving safe HTML formatting.
 *
 * @param {string} dirtyHtml - Raw HTML string from database or CMS.
 * @returns {string} Sanitized HTML string safe for dangerouslySetInnerHTML.
 */
export function sanitizeHtml(dirtyHtml) {
  if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';
  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'span', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'blockquote',
      'br', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'div', 'sub', 'sup'
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'title', 'id', 'aria-label'],
    ALLOW_DATA_ATTR: false
  });
}

export default sanitizeHtml;

