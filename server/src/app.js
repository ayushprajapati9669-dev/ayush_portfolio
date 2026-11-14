const http = require('http');
const fs = require('fs');
const path = require('path');
const { getEnvConfig } = require('./config/env');
const { PortfolioDataStore } = require('./repositories/portfolioRepository');
const { MemoryRateLimiter } = require('./middleware/rateLimitMiddleware');
const { setSecurityHeaders } = require('./middleware/securityMiddleware');
const { sendJson } = require('./utils/httpUtils');
const { createPublicController } = require('./controllers/publicController');
const { createAuthController } = require('./controllers/authController');
const { createAdminController } = require('./controllers/adminController');
const { dispatchApiRoutes } = require('./routes');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};

const CRAWLER_REGEX = /(facebookexternalhit|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|googlebot|bingbot|applebot|duckduckbot|yandexbot|baiduspider)/i;

function injectSocialOpenGraph(html, { title, description, image, url }) {
  let modified = html;
  const safeTitle = (title || 'Ayush Prajapati | Full-Stack & Systems Engineer').replace(/"/g, '&quot;');
  const safeDesc = (description || 'Portfolio of Ayush Prajapati: Full-Stack Developer specializing in MERN, Cloud & AI Systems.').replace(/"/g, '&quot;');
  const safeImage = (image || '/images/ayush-hero-portrait.jpg').replace(/"/g, '&quot;');
  const safeUrl = (url || 'https://ayushprajapati.dev').replace(/"/g, '&quot;');

  if (/<title>.*<\/title>/i.test(modified)) {
    modified = modified.replace(/<title>.*<\/title>/i, `<title>${safeTitle}</title>`);
  }

  const ogTags = [
    `<meta property="og:title" content="${safeTitle}" />`,
    `<meta property="og:description" content="${safeDesc}" />`,
    `<meta property="og:image" content="${safeImage}" />`,
    `<meta property="og:url" content="${safeUrl}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    `<meta name="twitter:description" content="${safeDesc}" />`,
    `<meta name="twitter:image" content="${safeImage}" />`,
    `<meta name="description" content="${safeDesc}" />`
  ].join('\n    ');

  if (modified.includes('</head>')) {
    modified = modified.replace('</head>', `    ${ogTags}\n  </head>`);
  }
  return modified;
}

function createPortfolioServer(customOptions = {}) {
  const config = { ...getEnvConfig(), ...customOptions };
  const dbPath = customOptions.dataFilePath || path.join(config.dataDir, 'portfolio.json');
  const store = new PortfolioDataStore(dbPath, config.uploadsDir);
  const loginLimiter = new MemoryRateLimiter(config.loginWindowMs, config.loginMaxAttempts);
  const contactLimiter = new MemoryRateLimiter(config.contactWindowMs, config.contactMaxAttempts);

  const controllers = {
    publicController: createPublicController({ store, contactLimiter }),
    authController: createAuthController({ store, config, loginLimiter }),
    adminController: createAdminController({ store, config })
  };

  const server = http.createServer(async (req, res) => {
    setSecurityHeaders(req, res, config);
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    try {
      // Static uploads serving with path-traversal protection
      if (req.method === 'GET' && pathname.startsWith('/uploads/')) {
        const safeBase = path.basename(pathname);
        const filePath = path.join(config.uploadsDir, safeBase);
        if (!fs.existsSync(filePath)) {
          return sendJson(res, 404, { error: 'Asset not found' });
        }
        const ext = path.extname(safeBase).toLowerCase();
        const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.pdf' ? 'application/pdf' : 'image/jpeg';
        res.statusCode = 200;
        res.setHeader('Content-Type', mime);
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
        return fs.createReadStream(filePath).pipe(res);
      }

      const handled = await dispatchApiRoutes(req, res, pathname, parsedUrl, controllers, config);
      if (handled) return;

      // Production SPA & Static Assets Serving with Social OpenGraph Pre-Injection
      if (req.method === 'GET') {
        const clientDistDir = config.clientDistDir || path.resolve(__dirname, '../../client/dist');
        const indexHtmlPath = path.join(clientDistDir, 'index.html');

        if (fs.existsSync(clientDistDir)) {
          // Check for direct static file in dist
          const sanitizedRelative = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
          const potentialFilePath = path.join(clientDistDir, sanitizedRelative);

          if (fs.existsSync(potentialFilePath) && fs.statSync(potentialFilePath).isFile()) {
            const ext = path.extname(potentialFilePath).toLowerCase();
            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            res.statusCode = 200;
            res.setHeader('Content-Type', mime);
            const isFingerprintedAsset = pathname.startsWith('/assets/') && /-[a-zA-Z0-9_-]{8,}\.[a-z0-9]+$/i.test(pathname);
            if (ext === '.html') {
              res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            } else if (isFingerprintedAsset) {
              // Fingerprinted bundle assets generated by Vite
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else {
              // Non-fingerprinted static images, uploads, and assets (/images/*, /favicon.svg, etc.)
              res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
            }
            return fs.createReadStream(potentialFilePath).pipe(res);
          }

          // SPA Fallback / Social Crawler Injection for routes
          if (fs.existsSync(indexHtmlPath)) {
            let html = fs.readFileSync(indexHtmlPath, 'utf8');
            const userAgent = req.headers['user-agent'] || '';
            const isCrawler = CRAWLER_REGEX.test(userAgent);

            if (isCrawler) {
              let title = 'Ayush Prajapati | Full-Stack & Systems Engineer';
              let description = 'Portfolio of Ayush Prajapati: Full-Stack Developer specializing in MERN, Cloud & AI Systems.';
              let image = '/images/ayush-hero-portrait.jpg';

              if (pathname.startsWith('/projects/')) {
                const slug = pathname.replace(/^\/projects\//, '').split('/')[0];
                const project = store.getPublicProjectBySlug(slug);
                if (project) {
                  title = `${project.title} | Ayush Prajapati Portfolio`;
                  description = project.shortDescription || project.summary || description;
                  image = project.coverImage || project.thumbnail || image;
                }
              }

              html = injectSocialOpenGraph(html, {
                title,
                description,
                image,
                url: `http://${req.headers.host || 'localhost'}${pathname}`
              });
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
            return res.end(html);
          }
        }
      }

      return sendJson(res, 404, { error: `Route ${req.method} ${pathname} not found.` });
    } catch (err) {
      const status = err.statusCode || 500;
      const safeMessage = status < 500 ? err.message : 'An unexpected server error occurred.';
      return sendJson(res, status, { error: safeMessage });
    }
  });

  return { server, store, config, loginLimiter, contactLimiter };
}

module.exports = { createPortfolioServer };
